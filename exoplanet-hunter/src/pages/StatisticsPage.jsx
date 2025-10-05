import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Statistics from '../components/dashboard/Statistics';

const StatisticsPage = () => {
  const [uploadedData, setUploadedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get data from localStorage or sessionStorage
    const savedData = localStorage.getItem('exoplanetData') || sessionStorage.getItem('uploadedData');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setUploadedData(parsedData);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleDataUpload = (data) => {
    setUploadedData(data);
    // Save to localStorage for persistence
    localStorage.setItem('exoplanetData', JSON.stringify(data));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-8 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-accent mx-auto mb-4"></div>
          <p className="text-cosmic-star">Loading statistics dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-8">
      <div className="container mx-auto max-w-7xl py-8">
        {/* Page Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-cosmic-star mb-4">
            📊 Statistical Analysis
          </h1>
          <p className="text-xl text-space-300 max-w-3xl mx-auto leading-relaxed">
            Explore comprehensive visualizations and statistical insights from exoplanet datasets
          </p>
        </motion.div>

        {/* Statistics Dashboard */}
        {uploadedData && uploadedData.length > 0 ? (
          <Statistics data={uploadedData} />
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-panel rounded-2xl p-12 border border-cosmic-purple/30 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">📈</div>
              <h3 className="text-2xl font-bold text-cosmic-star mb-4">No Data Available</h3>
              <p className="text-space-300 mb-8 leading-relaxed">
                Upload exoplanet data to view comprehensive statistical analysis including scatter plots, 
                distribution charts, and detailed visualizations.
              </p>
              
              {/* Quick upload section */}
              <div className="space-y-4">
                <motion.a
                  href="/upload"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cosmic-accent to-cosmic-purple text-cosmic-dark font-bold rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📊 Upload Data for Analysis
                </motion.a>
                
                <div className="mt-6 text-sm text-space-400">
                  <p>Supported formats: CSV files with exoplanet parameters</p>
                  <p>Features: Radius, Period, Temperature, Transit data, and more</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;