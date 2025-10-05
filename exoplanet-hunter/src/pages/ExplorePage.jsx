import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SpaceScene from '../components/3d/SpaceSceneFixed';
import ExoplanetGallery from '../components/ui/ExoplanetGallery';
import PlanetDetailModal from '../components/ui/PlanetDetailModal';

const ExplorePage = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  return (
    <div className="min-h-screen relative pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-8 py-12">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 nasa-title">
              Explore
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-cyan-300 to-gradient-cyan-500 block">
                Exoplanets
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed font-space">
              Discover confirmed exoplanets with interactive gallery and detailed information. 
              Use filters, search, and sorting to explore thousands of worlds beyond our solar system.
            </p>
          </motion.div>



          {/* Exoplanet Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ExoplanetGallery 
              onPlanetSelect={setSelectedPlanet}
              selectedPlanet={selectedPlanet}
            />
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="mt-12 grid md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-panel rounded-xl p-4 text-center border border-gradient-cyan-400/30">
              <div className="text-2xl font-bold text-gradient-cyan-300 mb-1 nasa-title">5,000+</div>
              <div className="text-white/80 font-space text-sm">Confirmed Exoplanets</div>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center border border-gradient-cyan-400/30">
              <div className="text-2xl font-bold text-gradient-cyan-300 mb-1 nasa-title">3,800+</div>
              <div className="text-white/80 font-space text-sm">Planetary Systems</div>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center border border-gradient-cyan-400/30">
              <div className="text-2xl font-bold text-gradient-cyan-300 mb-1 nasa-title">800+</div>
              <div className="text-white/80 font-space text-sm">Multi-Planet Systems</div>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center border border-gradient-cyan-400/30">
              <div className="text-2xl font-bold text-gradient-cyan-300 mb-1 nasa-title">160+</div>
              <div className="text-white/80 font-space text-sm">Potentially Habitable</div>
            </div>
          </motion.div>

          {/* Call to Action for Predictions */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4 nasa-title">🔮 Ready to Predict Habitability?</h2>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto font-space">
              Upload your own exoplanet data and use our AI-powered prediction system to analyze habitability potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <motion.button 
                  className="px-6 py-3 bg-gradient-to-r from-gradient-cyan-400 to-gradient-cyan-500 text-white font-display font-bold rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚀 Start Predictions
                </motion.button>
              </Link>
              <Link to="/statistics">
                <motion.button 
                  className="px-6 py-3 bg-gradient-to-r from-gradient-cyan-500 to-gradient-cyan-600 text-white font-display font-bold rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📊 View Statistics
                </motion.button>
              </Link>
            </div>
          </motion.div>


        </div>
      </div>

      {/* Planet Detail Modal */}
      <PlanetDetailModal 
        planet={selectedPlanet}
        isOpen={!!selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />
    </div>
  );
};

export default ExplorePage;
