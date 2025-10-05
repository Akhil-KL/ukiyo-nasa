import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PlanetDetailModal = ({ planet, isOpen, onClose }) => {
  if (!planet) return null;

  const getHabitabilityColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHabitabilityBgColor = (score) => {
    if (score >= 80) return 'from-green-500/20 to-emerald-600/20';
    if (score >= 60) return 'from-yellow-500/20 to-orange-500/20';
    if (score >= 40) return 'from-orange-500/20 to-red-500/20';
    return 'from-red-500/20 to-red-700/20';
  };

  const getPlanetColor = () => {
    if (planet.type === 'Hot Jupiter') return 'from-orange-400 to-red-600';
    if (planet.type === 'Terrestrial') return 'from-blue-400 to-green-500';
    if (planet.type === 'Super Earth') return 'from-green-400 to-blue-500';
    return 'from-purple-400 to-pink-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="card-enhanced max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-display font-bold text-white nasa-title mb-2">
                  {planet.name}
                </h2>
                <p className="text-gradient-red-300 font-space text-lg">
                  Orbiting {planet.hostStar}
                </p>
              </div>
              <motion.button 
                onClick={onClose}
                className="text-white/60 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Planet Visualization */}
              <div className="lg:col-span-1 space-y-6">
                {/* 3D Planet Preview */}
                <div className="relative h-64 bg-gradient-to-br from-black/40 to-gradient-red-900/20 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className={`w-32 h-32 rounded-full bg-gradient-to-br ${getPlanetColor()}`}
                      style={{
                        transform: `scale(${Math.min(planet.radius / 1.5, 1.2)})`,
                      }}
                      animate={{ 
                        rotateY: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                    
                    {/* Atmospheric glow effect */}
                    {planet.atmosphere !== "Unknown" && (
                      <motion.div 
                        className="absolute w-40 h-40 rounded-full border-2 border-blue-400/30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  
                  {/* Planet Stats Overlay */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="text-xs text-white/60 font-space">Type</div>
                      <div className="text-sm text-white font-semibold">{planet.type}</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="text-xs text-white/60 font-space">Discovery</div>
                      <div className="text-sm text-white font-semibold">{planet.discoveryYear}</div>
                    </div>
                  </div>

                  {/* Habitability Score */}
                  <div className="absolute bottom-4 right-4">
                    <div className={`bg-gradient-to-r ${getHabitabilityBgColor(planet.habitabilityScore)} backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20`}>
                      <div className="text-xs text-white/80 font-space">Habitability</div>
                      <div className={`text-lg font-bold ${getHabitabilityColor(planet.habitabilityScore)}`}>
                        {planet.habitabilityScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Facts */}
                <div className="space-y-3">
                  <h4 className="text-lg font-display font-bold text-white nasa-title">Quick Facts</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 px-3 bg-black/40 rounded-lg">
                      <span className="text-white/60 font-space text-sm">Discovery Method</span>
                      <span className="text-white font-medium text-sm">{planet.method}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-black/40 rounded-lg">
                      <span className="text-white/60 font-space text-sm">Stellar Type</span>
                      <span className="text-white font-medium text-sm">{planet.stellarType}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-black/40 rounded-lg">
                      <span className="text-white/60 font-space text-sm">Surface Gravity</span>
                      <span className="text-white font-medium text-sm">{planet.surfaceGravity}× Earth</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Detailed Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-xl font-display font-bold text-white nasa-title mb-3">Overview</h4>
                  <p className="text-white/80 leading-relaxed font-space">
                    {planet.description}
                  </p>
                </div>

                {/* Physical Properties */}
                <div>
                  <h4 className="text-xl font-display font-bold text-white nasa-title mb-4">Physical Properties</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <motion.div 
                      className="bg-gradient-to-br from-black/60 to-gradient-red-900/20 rounded-xl p-4 border border-gradient-red-400/30"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gradient-red-300 font-space text-sm mb-1">Radius</div>
                      <div className="text-2xl font-bold text-white">{planet.radius}×</div>
                      <div className="text-white/60 font-space text-xs">Earth radii</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-black/60 to-gradient-red-900/20 rounded-xl p-4 border border-gradient-red-400/30"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gradient-red-300 font-space text-sm mb-1">Mass</div>
                      <div className="text-2xl font-bold text-white">{planet.mass}×</div>
                      <div className="text-white/60 font-space text-xs">Earth masses</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-black/60 to-gradient-red-900/20 rounded-xl p-4 border border-gradient-red-400/30"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gradient-red-300 font-space text-sm mb-1">Temperature</div>
                      <div className="text-2xl font-bold text-white">{planet.temperature}</div>
                      <div className="text-white/60 font-space text-xs">Kelvin ({Math.round(planet.temperature - 273.15)}°C)</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-black/60 to-gradient-red-900/20 rounded-xl p-4 border border-gradient-red-400/30"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gradient-red-300 font-space text-sm mb-1">Distance</div>
                      <div className="text-2xl font-bold text-white">{planet.distance}</div>
                      <div className="text-white/60 font-space text-xs">light-years</div>
                    </motion.div>
                  </div>
                </div>

                {/* Orbital Properties */}
                <div>
                  <h4 className="text-xl font-display font-bold text-white nasa-title mb-4">Orbital Properties</h4>
                  <div className="bg-gradient-to-br from-black/40 to-gradient-red-900/20 rounded-xl p-6 border border-gradient-red-400/30">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <div className="text-gradient-red-300 font-space text-sm mb-2">Orbital Period</div>
                        <div className="text-xl font-bold text-white">{planet.orbitalPeriod} days</div>
                        <div className="text-white/60 font-space text-xs mt-1">
                          {(planet.orbitalPeriod / 365.25).toFixed(2)} Earth years
                        </div>
                      </div>
                      <div>
                        <div className="text-gradient-red-300 font-space text-sm mb-2">Surface Gravity</div>
                        <div className="text-xl font-bold text-white">{planet.surfaceGravity}× Earth</div>
                        <div className="text-white/60 font-space text-xs mt-1">
                          {(planet.surfaceGravity * 9.81).toFixed(1)} m/s²
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atmosphere */}
                <div>
                  <h4 className="text-xl font-display font-bold text-white nasa-title mb-3">Atmosphere</h4>
                  <div className="bg-gradient-to-br from-black/40 to-gradient-red-900/20 rounded-xl p-4 border border-gradient-red-400/30">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {planet.atmosphere === "Unknown" ? "❓" : 
                         planet.atmosphere.includes("H₂O") ? "💧" :
                         planet.atmosphere.includes("H₂") ? "🌀" : "🌫️"}
                      </div>
                      <div>
                        <div className="text-white font-medium">{planet.atmosphere}</div>
                        <div className="text-white/60 font-space text-sm">
                          {planet.atmosphere === "Unknown" ? 
                            "Atmospheric composition not yet determined" :
                            "Detected through spectroscopic analysis"
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gradient-red-400/20">
              <motion.button 
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-gradient-red-400 to-gradient-red-500 text-white font-display font-bold rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close Details
              </motion.button>
              <motion.button 
                className="px-6 py-3 border-2 border-gradient-red-400 text-white font-display font-bold rounded-xl hover:bg-gradient-red-600/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add to Favorites
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanetDetailModal;