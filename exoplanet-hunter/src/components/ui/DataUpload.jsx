import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

const DataUpload = ({ onDataUploaded, className = '' }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('drag');
  const [pastedText, setPastedText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // File validation
  const validateFile = (file) => {
    if (!file) return 'No file selected';
    
    const isCSV = file.type === 'text/csv' || 
                  file.type === 'application/csv' || 
                  file.type === 'text/plain' ||
                  file.name.toLowerCase().endsWith('.csv') ||
                  file.name.toLowerCase().endsWith('.tsv');
    
    if (!isCSV) {
      return 'Please upload a CSV or TSV file only';
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
      return 'File size must be less than 50MB';
    }
    
    return null;
  };

  // Enhanced CSV parsing with better error handling and NASA data format support
  const parseCSVData = useCallback((input, fileName, isFile = false) => {
    setIsLoading(true);
    setError('');
    
    // Pre-process CSV to handle NASA dataset format with comment headers
    const preprocessCSV = (csvText) => {
      if (!csvText || typeof csvText !== 'string') {
        throw new Error('Invalid CSV data provided');
      }
      
      const lines = csvText.split('\n');
      // Find the first non-comment line (header)
      const headerIndex = lines.findIndex(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//');
      });
      
      if (headerIndex === -1) {
        throw new Error('No valid header found in data');
      }
      
      // Return only non-comment lines
      const validLines = lines.slice(headerIndex).filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//');
      });
      
      if (validLines.length < 2) {
        throw new Error('Data must contain at least a header and one data row');
      }
      
      return validLines.join('\n');
    };
    
    const parseConfig = {
      complete: (results) => {
        setIsLoading(false);
        
        try {
          // Handle parsing errors more gracefully for NASA data
          if (results.errors && results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
            
            // Filter out non-critical errors for NASA datasets
            const criticalErrors = results.errors.filter(error => 
              error.type !== 'FieldMismatch' && 
              error.type !== 'Delimiter' &&
              !error.message.includes('Too many fields')
            );
            
            if (criticalErrors.length > 0) {
              const errorMessage = criticalErrors[0].message || 'Unknown parsing error';
              setError(`CSV parsing error: ${errorMessage}`);
              return;
            }
          }
          
          if (!results.data || results.data.length === 0) {
            setError('No data found in the file. Please check the format.');
            return;
          }
          
          // Filter out completely empty rows
          const validData = results.data.filter(row => {
            if (!row || typeof row !== 'object') return false;
            return Object.values(row).some(value => 
              value !== null && value !== undefined && 
              value.toString().trim() !== '' &&
              value.toString().trim() !== 'null' &&
              value.toString().trim() !== 'undefined'
            );
          });
          
          if (validData.length === 0) {
            setError('No valid data rows found. Please check that your data contains actual values.');
            return;
          }
          
          // Validate that we have some columns
          const firstRow = validData[0];
          const columnCount = Object.keys(firstRow).length;
          if (columnCount === 0) {
            setError('No columns detected in the data.');
            return;
          }
          
          console.log(`Successfully parsed ${validData.length} rows with ${columnCount} columns`);
          
          // Create file info
          const fileInfo = isFile ? input : { 
            name: fileName, 
            size: input.length, 
            type: 'text/csv' 
          };
          
          // Set preview (first 5 rows)
          setPreviewData(validData.slice(0, 5));
          setUploadedFile(fileInfo);
          
          // Call callback
          if (onDataUploaded) {
            onDataUploaded(validData, fileInfo);
          }
        } catch (error) {
          setIsLoading(false);
          setError(`Error processing parsed data: ${error.message}`);
        }
      },
      error: (error) => {
        setIsLoading(false);
        console.error('Papa Parse error:', error);
        setError(`Failed to parse CSV: ${error.message || 'Unknown parsing error'}`);
      },
      header: true,
      skipEmptyLines: 'greedy', // Skip all empty lines
      trimHeaders: true,
      delimiter: '', // Auto-detect delimiter
      quoteChar: '"',
      escapeChar: '"',
      dynamicTyping: false, // Keep as strings to avoid type conversion issues
      transformHeader: (header, index) => {
        // Clean header names
        return header.trim().replace(/[^\w\s-_.]/g, '').replace(/\s+/g, '_');
      },
      transform: (value, header) => {
        if (value === null || value === undefined) return '';
        const trimmed = value.toString().trim();
        // Handle common null/empty representations
        if (trimmed === '' || trimmed.toLowerCase() === 'null' || 
            trimmed.toLowerCase() === 'na' || trimmed === 'NaN') {
          return '';
        }
        return trimmed;
      },
      beforeFirstChunk: function(chunk) {
        // Pre-process chunk to remove comment lines for NASA datasets
        if (isFile) {
          return chunk; // Papa Parse handles file reading
        } else {
          try {
            return preprocessCSV(chunk);
          } catch (e) {
            console.warn('Preprocessing failed, using original chunk:', e.message);
            return chunk; // Fallback to original if preprocessing fails
          }
        }
      }
    };
    
    if (isFile) {
      // For file input, use Papa Parse's file reading with preprocessing
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const csvText = e.target.result;
          if (!csvText || csvText.trim() === '') {
            setIsLoading(false);
            setError('File appears to be empty');
            return;
          }
          const processedText = preprocessCSV(csvText);
          Papa.parse(processedText, parseConfig);
        } catch (error) {
          setIsLoading(false);
          setError(`Failed to process file: ${error.message}`);
        }
      };
      reader.onerror = function() {
        setIsLoading(false);
        setError('Failed to read file');
      };
      reader.readAsText(input);
    } else {
      // For text input, preprocess first
      try {
        if (!input || input.trim() === '') {
          setIsLoading(false);
          setError('No data provided');
          return;
        }
        const processedText = preprocessCSV(input);
        Papa.parse(processedText, parseConfig);
      } catch (error) {
        setIsLoading(false);
        setError(`Failed to process CSV: ${error.message}`);
      }
    }
  }, [onDataUploaded]);

  // File drop handlers
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    dragCounterRef.current = 0;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    parseCSVData(file, file.name, true);
  }, [parseCSVData]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  // File input handler
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    parseCSVData(file, file.name, true);
  }, [parseCSVData]);

  // Upload method handlers
  const handlePasteUpload = useCallback(() => {
    if (!pastedText.trim()) {
      setError('Please paste some CSV data first');
      return;
    }
    parseCSVData(pastedText, 'pasted-data.csv');
  }, [pastedText, parseCSVData]);

  const handleUrlUpload = useCallback(async () => {
    if (!urlInput.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      parseCSVData(csvText, 'url-data.csv');
    } catch (error) {
      setIsLoading(false);
      setError(`Failed to fetch data: ${error.message}`);
    }
  }, [urlInput, parseCSVData]);

  const handleSampleData = useCallback(() => {
    const sampleCSV = `# Sample NASA Exoplanet Archive Data
# Generated for demonstration purposes
pl_name,hostname,disposition,discoverymethod,disc_year,pl_orbper,pl_rade,pl_bmasse,st_teff,st_rad,st_mass,sy_dist
Kepler-452b,Kepler-452,CONFIRMED,Transit,2015,384.843,1.6,5.0,5757,1.11,1.04,1402
TRAPPIST-1e,TRAPPIST-1,CONFIRMED,Transit,2017,6.099615,0.92,0.69,2559,0.121,0.089,40.7
Proxima Centauri b,Proxima Centauri,CONFIRMED,Radial Velocity,2016,11.186,1.1,1.17,3042,0.154,0.122,4.24
K2-18 b,K2-18,CONFIRMED,Transit,2015,32.940,2.3,8.6,3457,0.41,0.36,124
TOI-715 b,TOI-715,CONFIRMED,Transit,2024,19.28,1.55,3.02,3341,0.374,0.357,137
HD 209458 b,HD 209458,CONFIRMED,Transit,1999,3.52474859,1.4,0.69,6065,1.155,1.119,159`;
    
    parseCSVData(sampleCSV, 'sample-exoplanets.csv');
  }, [parseCSVData]);

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewData(null);
    setError('');
    setPastedText('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadMethods = [
    { id: 'drag', name: 'Drag & Drop', icon: '📁' },
    { id: 'paste', name: 'Paste Data', icon: '📋' },
    { id: 'url', name: 'From URL', icon: '🌐' },
    { id: 'sample', name: 'Sample Data', icon: '🎯' }
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto pointer-events-auto ${className}`}>
      <motion.div
        className="glass-panel rounded-2xl p-6 border border-gradient-red-400/30"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Upload Methods Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {uploadMethods.map((method) => (
            <motion.button
              key={method.id}
              className={`px-6 py-3 rounded-xl border font-display font-semibold text-base transition-all duration-300 pointer-events-auto cursor-pointer ${
                uploadMethod === method.id
                  ? 'bg-gradient-to-r from-gradient-red-400 via-gradient-red-300 to-gradient-red-200 text-white border-gradient-red-300 cosmic-glow'
                  : 'glass-button text-white border-gradient-red-500/40 hover:border-gradient-red-400/60 hover:bg-gradient-red-600/20'
              }`}
              onClick={() => setUploadMethod(method.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="mr-3 text-lg">{method.icon}</span>
              <span className="nasa-title text-sm">{method.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="bg-gradient-red-700/60 border border-gradient-red-400/60 rounded-xl p-4 mb-6 text-white card-enhanced"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="font-space font-medium text-base">❌ {error}</p>
          </motion.div>
        )}

        {/* Upload Interface */}
        <div className="space-y-6">
          {/* Drag and Drop */}
          {uploadMethod === 'drag' && (
            <motion.div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer min-h-[280px] flex items-center justify-center pointer-events-auto card-enhanced ${
                isDragActive
                  ? 'border-gradient-red-300 bg-gradient-red-600/30 shadow-2xl shadow-gradient-red-400/40 scale-105 cosmic-glow'
                  : 'border-gradient-red-500/60 hover:border-gradient-red-400/80 hover:bg-gradient-red-600/10'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,text/csv,text/tab-separated-values"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="text-center">
                {isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-gradient-red-300 mb-4 cosmic-glow"></div>
                    <p className="text-xl text-white font-display font-semibold nasa-title">Processing...</p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-4">
                      {isDragActive ? '⬇️' : '📁'}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-3 nasa-title">
                      {isDragActive ? 'Drop your file here!' : 'Drag & Drop CSV File'}
                    </h3>
                    <p className="text-white/80 mb-4 font-space text-base space-text">
                      Or click to browse and select a file
                    </p>
                    <p className="text-sm text-white/60 font-space">
                      Supports CSV, TSV files up to 50MB
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Paste Method */}
          {uploadMethod === 'paste' && (
            <div className="card-enhanced pointer-events-auto">
              <h3 className="text-xl font-display font-bold text-white mb-4 nasa-title">📋 Paste CSV Data</h3>
              <div className="space-y-4">
                <textarea
                  className="w-full h-48 bg-black/70 border border-gradient-red-400/40 rounded-xl p-4 text-white placeholder-white/60 focus:border-gradient-red-300 focus:outline-none transition-colors font-mono text-sm resize-vertical"
                  placeholder="Paste your CSV data here...\nExample:\nplanet_name,mass,radius\nKepler-452b,5.0,1.6"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
                <div className="flex justify-end">
                  <motion.button
                    className="px-6 py-3 bg-gradient-red-500 glass-button text-white rounded-xl font-display font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    disabled={!pastedText.trim() || isLoading}
                    onClick={handlePasteUpload}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Processing...' : 'Parse Data'}
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* URL Method */}
          {uploadMethod === 'url' && (
            <div className="card-enhanced pointer-events-auto">
              <h3 className="text-xl font-display font-bold text-white mb-4 nasa-title">🌐 Load from URL</h3>
              <div className="space-y-4">
                <input
                  type="url"
                  className="w-full bg-black/70 border border-gradient-red-400/40 rounded-xl p-4 text-white placeholder-white/60 focus:border-gradient-red-300 focus:outline-none transition-colors font-mono text-base"
                  placeholder="https://example.com/data.csv"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <div className="flex justify-end">
                  <motion.button
                    className="px-6 py-3 bg-gradient-red-500 glass-button text-white rounded-xl font-display font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    disabled={!urlInput.trim() || isLoading}
                    onClick={handleUrlUpload}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Fetching...' : 'Load Data'}
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Sample Data Method */}
          {uploadMethod === 'sample' && (
            <div className="card-enhanced pointer-events-auto">
              <h3 className="text-xl font-display font-bold text-white mb-4 nasa-title">🎯 Sample Exoplanet Data</h3>
              <p className="text-white/80 mb-6 font-space space-text text-base leading-relaxed">
                Load a sample dataset containing information about confirmed exoplanets 
                including Kepler-452b, TRAPPIST-1e, and other notable discoveries.
              </p>
              <div className="text-center">
                <motion.button
                  className="w-full py-4 bg-gradient-to-r from-gradient-red-300 via-gradient-red-400 to-gradient-red-500 text-white rounded-xl font-display font-bold text-base pointer-events-auto cosmic-glow"
                  onClick={handleSampleData}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Loading...' : 'Load Sample Data'}
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Data */}
        {previewData && (
          <motion.div
            className="mt-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white nasa-title">✅ Upload Successful</h3>
              <button
                onClick={resetUpload}
                className="px-4 py-2 text-white/80 hover:text-white border border-gradient-red-400/30 hover:border-gradient-red-300/50 rounded-lg transition-all duration-200 pointer-events-auto glass-button"
              >
                Upload New File
              </button>
            </div>
            
            <div className="glass-panel rounded-lg p-4 border border-gradient-red-400/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gradient-red-300 font-medium font-space">📄 {uploadedFile?.name}</span>
                <span className="text-white/60 text-sm font-space">
                  {previewData.length} rows × {Object.keys(previewData[0] || {}).length} columns
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gradient-red-400/30">
                      {Object.keys(previewData[0] || {}).map(header => (
                        <th key={header} className="py-2 px-3 text-gradient-red-300 font-semibold font-space">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b border-gradient-red-500/10">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="py-2 px-3 text-white/80 font-space">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DataUpload;