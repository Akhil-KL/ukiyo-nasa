import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import UploadPage from './pages/UploadPage';
import StatisticsPage from './pages/StatisticsPage';
import AboutPage from './pages/AboutPage';
import SpaceScene from './components/3d/SpaceSceneFixed';

// Component to handle dynamic planet data from uploaded CSV
function DynamicSpaceScene() {
  const [planetsData, setPlanetsData] = useState(null);

  useEffect(() => {
    // Try to get uploaded exoplanet data from localStorage
    const checkForData = () => {
      try {
        const savedData = localStorage.getItem('exoplanetData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData && parsedData.length > 0) {
            // Only use a subset of data for performance (max 12 planets)
            setPlanetsData(parsedData.slice(0, 12));
          }
        }
      } catch (error) {
        console.log('No valid exoplanet data found in localStorage');
      }
    };

    // Check immediately
    checkForData();

    // Listen for storage changes (when data is uploaded)
    const handleStorageChange = (e) => {
      if (e.key === 'exoplanetData') {
        checkForData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case data was updated in the same tab
    const interval = setInterval(checkForData, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <SpaceScene planetsData={planetsData} />
  );;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark via-space-900 to-cosmic-dark">
        {/* Fixed Space Scene Background - MUST be z-index 0 for proper 3D rendering */}
        <div className="fixed inset-0 z-0">
          <DynamicSpaceScene />
        </div>

        {/* Navigation Layer */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        {/* Main Content Layer with proper scrolling and z-index */}
        <div className="relative z-10 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;