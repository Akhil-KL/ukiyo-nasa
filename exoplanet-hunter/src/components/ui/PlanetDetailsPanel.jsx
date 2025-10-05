import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlanetDetailsPanel({ planet, isVisible, onClose }) {
  if (!planet) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 w-96 max-w-[90vw]"
          >
            <div className="glass-panel p-6 rounded-2xl border border-cosmic-purple/30 backdrop-blur-lg">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-cosmic-white mb-1">
                    {planet.name}
                  </h2>
                  <p className="text-cosmic-blue text-sm opacity-80">
                    {planet.data.type}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-cosmic-white/60 hover:text-cosmic-white transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Planet Visualization */}
              <div className="mb-6 p-4 bg-cosmic-dark/30 rounded-xl border border-cosmic-purple/20">
                <div className="flex items-center justify-center h-20">
                  <div 
                    className="w-16 h-16 rounded-full shadow-lg animate-pulse"
                    style={{ backgroundColor: planet.color }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-3">
                <DetailRow label="Radius" value={planet.data.radius} />
                <DetailRow label="Mass" value={planet.data.mass} />
                <DetailRow label="Distance" value={planet.data.distance} />
                <DetailRow label="Temperature" value={planet.data.temperature} />
                <DetailRow label="Discovery Year" value={planet.data.discoveryYear} />
                <DetailRow label="Host Star" value={planet.data.hostStar} />
                
                {planet.data.atmosphere && (
                  <DetailRow label="Atmosphere" value={planet.data.atmosphere} />
                )}
                
                {planet.data.significance && (
                  <div className="mt-4 p-3 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20">
                    <p className="text-xs text-cosmic-blue font-medium mb-1">SIGNIFICANCE</p>
                    <p className="text-sm text-cosmic-white/90">{planet.data.significance}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button className="flex-1 glass-button py-2 px-4 rounded-lg text-sm font-medium text-cosmic-white hover:bg-cosmic-purple/20 transition-colors">
                  View Details
                </button>
                <button className="flex-1 glass-button py-2 px-4 rounded-lg text-sm font-medium text-cosmic-white hover:bg-cosmic-blue/20 transition-colors">
                  Compare
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-cosmic-purple/10">
      <span className="text-cosmic-blue text-sm font-medium">{label}</span>
      <span className="text-cosmic-white text-sm">{value}</span>
    </div>
  );
}