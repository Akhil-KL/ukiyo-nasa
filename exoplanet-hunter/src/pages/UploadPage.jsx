import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DataUpload from '../components/ui/DataUpload';
import PredictionInterface from '../components/prediction/PredictionInterface';

const UploadPage = () => {
  const [uploadedData, setUploadedData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [predictionResults, setPredictionResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDataUpload = useCallback((data, file) => {
    console.log('Data uploaded:', { 
      fileName: file.name, 
      rowCount: data.length,
      columns: data.length > 0 ? Object.keys(data[0]) : []
    });
    
    setUploadedData({ data, file });
    setPredictionResults(null); // Reset predictions when new data is uploaded
    
    // Save data to localStorage for Statistics page access
    localStorage.setItem('exoplanetData', JSON.stringify(data));
    localStorage.setItem('uploadedFileName', file.name);
    
    // Simulate analysis
    setIsAnalyzing(true);
    setTimeout(() => {
      const analysis = analyzeData(data);
      setAnalysisResults(analysis);
      setIsAnalyzing(false);
    }, 2000);
  }, []);

  const handlePredictionResults = useCallback((results) => {
    setPredictionResults(results);
    console.log('Prediction results:', results);
  }, []);

  const analyzeData = (data) => {
    if (!data || data.length === 0) return null;
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => 
      data.some(row => !isNaN(parseFloat(row[col])))
    );
    
    const stats = numericColumns.reduce((acc, col) => {
      const values = data
        .map(row => parseFloat(row[col]))
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        acc[col] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          count: values.length
        };
      }
      return acc;
    }, {});

    // Look for exoplanet-related columns
    const planetColumns = columns.filter(col => 
      col.toLowerCase().includes('planet') || 
      col.toLowerCase().includes('radius') ||
      col.toLowerCase().includes('mass') ||
      col.toLowerCase().includes('period') ||
      col.toLowerCase().includes('distance') ||
      col.toLowerCase().includes('temp')
    );

    return {
      totalRows: data.length,
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      planetColumns,
      stats,
      sampleData: data.slice(0, 5)
    };
  };

  const resetData = () => {
    setUploadedData(null);
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen relative pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-12">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 nasa-title text-glow">
            Upload
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-cyan-300 via-gradient-cyan-400 to-gradient-cyan-500 block mt-2">
              Your Data
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed font-space space-text">
            Upload your exoplanet detection data and let our AI analyze it to predict whether your findings are:
            <span className="text-gradient-cyan-300 font-semibold"> Confirmed Exoplanets</span>, 
            <span className="text-yellow-400 font-semibold"> Candidate Exoplanets</span>, or 
            <span className="text-purple-400 font-semibold"> False Positives</span>. 
            Perfect for scientists validating their discoveries!
          </p>
        </motion.div>

        {/* Upload Component */}
        {!uploadedData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <DataUpload onDataUploaded={handleDataUpload} />
          </motion.div>
        )}

        {/* Analysis Results */}
        {uploadedData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* File Info */}
            <div className="card-enhanced">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-white nasa-title">Uploaded File</h2>
                <motion.button
                  onClick={resetData}
                  className="px-6 py-3 glass-button text-white hover:text-white border border-gradient-cyan-400/40 hover:border-gradient-cyan-300/60 rounded-xl transition-all duration-300 font-space text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upload New File
                </motion.button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-black/70 rounded-xl p-4 border border-gradient-cyan-400/30 card-enhanced">
                  <div className="text-white/60 text-sm mb-2 font-space">File Name</div>
                  <div className="text-white font-medium font-display text-sm">{uploadedData.file.name}</div>
                </div>
                <div className="bg-black/70 rounded-xl p-4 border border-gradient-cyan-400/30 card-enhanced">
                  <div className="text-white/60 text-sm mb-2 font-space">Size</div>
                  <div className="text-white font-medium font-display text-sm">
                    {(uploadedData.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div className="bg-cosmic-dark/70 rounded-xl p-6 border border-cosmic-purple/30 card-enhanced">
                  <div className="text-space-400 text-sm mb-2 font-space">Rows</div>
                  <div className="text-cosmic-star font-medium font-display">{uploadedData.data.length}</div>
                </div>
              </div>
            </div>

            {/* Analysis Loading */}
            {isAnalyzing && (
              <div className="card-enhanced enhanced-spacing text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cosmic-accent mb-6 cosmic-glow"></div>
                <h3 className="text-2xl font-display font-semibold text-cosmic-star mb-4 nasa-title">Analyzing Your Data</h3>
                <p className="text-space-300 font-space space-text">Processing columns and generating insights...</p>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResults && !isAnalyzing && (
              <div className="space-y-8">
                {/* Overview Stats */}
                <div className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-cosmic-star">Data Overview</h3>
                    <motion.a
                      href="/statistics"
                      className="px-6 py-3 bg-gradient-to-r from-cosmic-accent to-cosmic-purple text-cosmic-dark font-bold rounded-lg inline-flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>📊</span>
                      <span>View Detailed Statistics</span>
                    </motion.a>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-cosmic-dark/50 rounded-lg p-4 border border-cosmic-purple/20 text-center">
                      <div className="text-2xl font-bold text-cosmic-accent mb-1">
                        {analysisResults.totalRows.toLocaleString()}
                      </div>
                      <div className="text-space-400 text-sm">Total Rows</div>
                    </div>
                    <div className="bg-cosmic-dark/50 rounded-lg p-4 border border-cosmic-purple/20 text-center">
                      <div className="text-2xl font-bold text-cosmic-accent mb-1">
                        {analysisResults.totalColumns}
                      </div>
                      <div className="text-space-400 text-sm">Columns</div>
                    </div>
                    <div className="bg-cosmic-dark/50 rounded-lg p-4 border border-cosmic-purple/20 text-center">
                      <div className="text-2xl font-bold text-cosmic-accent mb-1">
                        {analysisResults.numericColumns}
                      </div>
                      <div className="text-space-400 text-sm">Numeric Columns</div>
                    </div>
                    <div className="bg-cosmic-dark/50 rounded-lg p-4 border border-cosmic-purple/20 text-center">
                      <div className="text-2xl font-bold text-cosmic-accent mb-1">
                        {analysisResults.planetColumns.length}
                      </div>
                      <div className="text-space-400 text-sm">Planet-related</div>
                    </div>
                  </div>
                </div>

                {/* Column Statistics */}
                {Object.keys(analysisResults.stats).length > 0 && (
                  <div className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30">
                    <h3 className="text-2xl font-bold text-cosmic-star mb-6">Column Statistics</h3>
                    <div className="grid gap-4">
                      {Object.entries(analysisResults.stats).map(([column, stats]) => (
                        <div key={column} className="bg-cosmic-dark/50 rounded-lg p-4 border border-cosmic-purple/20">
                          <h4 className="text-lg font-semibold text-cosmic-star mb-3">{column}</h4>
                          <div className="grid md:grid-cols-4 gap-3">
                            <div className="text-center">
                              <div className="text-cosmic-accent font-bold">{stats.min.toFixed(2)}</div>
                              <div className="text-space-400 text-sm">Min</div>
                            </div>
                            <div className="text-center">
                              <div className="text-cosmic-accent font-bold">{stats.max.toFixed(2)}</div>
                              <div className="text-space-400 text-sm">Max</div>
                            </div>
                            <div className="text-center">
                              <div className="text-cosmic-accent font-bold">{stats.avg.toFixed(2)}</div>
                              <div className="text-space-400 text-sm">Average</div>
                            </div>
                            <div className="text-center">
                              <div className="text-cosmic-accent font-bold">{stats.count}</div>
                              <div className="text-space-400 text-sm">Valid Values</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Data Preview */}
                <div className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30">
                  <h3 className="text-2xl font-bold text-cosmic-star mb-6">Data Preview</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-cosmic-purple/30">
                          {Object.keys(analysisResults.sampleData[0] || {}).map(header => (
                            <th key={header} className="py-3 px-4 text-cosmic-accent font-semibold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResults.sampleData.map((row, index) => (
                          <tr key={index} className="border-b border-cosmic-purple/10 hover:bg-cosmic-purple/5">
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="py-3 px-4 text-space-300">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {analysisResults.totalRows > 5 && (
                    <p className="text-space-400 text-sm mt-4 text-center">
                      Showing 5 of {analysisResults.totalRows} rows
                    </p>
                  )}
                </div>

                {/* Planet-related Columns */}
                {analysisResults.planetColumns.length > 0 && (
                  <div className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30">
                    <h3 className="text-2xl font-bold text-cosmic-star mb-6">Detected Exoplanet Columns</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {analysisResults.planetColumns.map(column => (
                        <div key={column} className="bg-cosmic-dark/50 rounded-lg p-3 border border-cosmic-purple/20">
                          <span className="text-cosmic-accent font-medium">{column}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-space-300 text-sm mt-4">
                      These columns appear to contain exoplanet-related data and can be used for specialized analysis.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Prediction Interface - Prompt 7 Implementation */}
        {uploadedData && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PredictionInterface 
              data={uploadedData.data}
              onResults={handlePredictionResults}
            />
          </motion.div>
        )}

        {/* User Flow Guidelines */}
        <motion.div 
          className="mt-16 glass-panel rounded-2xl p-8 border border-gradient-cyan-400/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">How Scientists Use This Tool</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gradient-cyan-400 to-gradient-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔬</span>
              </div>
              <h4 className="text-lg font-semibold text-gradient-cyan-300 mb-3">Data Validation</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Upload your potential exoplanet detection data. Our AI will analyze the parameters and 
                classify your findings as <strong>Confirmed</strong>, <strong>Candidate</strong>, or <strong>False Positive</strong>.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gradient-cyan-400 to-gradient-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-semibold text-gradient-cyan-300 mb-3">Batch Analysis</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Process multiple exoplanet candidates at once. Get confidence scores, habitability assessments, 
                and detailed analysis for each object in your dataset.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gradient-cyan-400 to-gradient-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="text-lg font-semibold text-gradient-cyan-300 mb-3">Export Results</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Download your analysis results as JSON files for further research, publication, 
                or integration with other astronomical tools and databases.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Guidelines */}
        {!uploadedData && (
          <motion.div 
            className="mt-16 glass-panel rounded-2xl p-8 border border-cosmic-purple/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-cosmic-star mb-6">Data Format Guidelines</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-cosmic-accent mb-4">Supported Formats</h4>
                <ul className="space-y-2 text-space-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>CSV files (Comma-separated values)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>Tab-separated values (TSV)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>Semicolon-separated values</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>Maximum file size: 10MB</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-cosmic-accent mb-4">Recommended Columns</h4>
                <ul className="space-y-2 text-space-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>Planet name or identifier</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>Mass, radius, orbital period</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>Distance from Earth</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cosmic-accent">•</span>
                    <span>Host star properties</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
