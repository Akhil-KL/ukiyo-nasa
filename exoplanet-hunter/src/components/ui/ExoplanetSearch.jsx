import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExoplanetSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name'); // name, host, type, all
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedExoplanet, setSelectedExoplanet] = useState(null);

  // Comprehensive exoplanet database
  const exoplanetDatabase = [
    {
      id: 1,
      name: "Kepler-452b",
      hostStar: "Kepler-452",
      disposition: "Confirmed",
      radius: 1.6,
      mass: 5.0,
      orbitalPeriod: 384.8,
      temperature: 265,
      distance: 1402,
      discoveryYear: 2015,
      method: "Transit",
      type: "Super Earth",
      habitabilityScore: 78,
      description: "Often called 'Earth's cousin', this planet orbits in the habitable zone of a Sun-like star.",
      atmosphere: "Unknown",
      surfaceGravity: 2.3,
      stellarType: "G2V",
      composition: "Rocky",
      magneticField: "Unknown"
    },
    {
      id: 2,
      name: "TRAPPIST-1e",
      hostStar: "TRAPPIST-1",
      disposition: "Confirmed",
      radius: 0.92,
      mass: 0.69,
      orbitalPeriod: 6.1,
      temperature: 251,
      distance: 40.7,
      discoveryYear: 2017,
      method: "Transit",
      type: "Terrestrial",
      habitabilityScore: 85,
      description: "Part of a seven-planet system, this world sits in the habitable zone of its ultra-cool dwarf star.",
      atmosphere: "Potentially Dense",
      surfaceGravity: 0.93,
      stellarType: "M8V",
      composition: "Rocky",
      magneticField: "Likely"
    },
    {
      id: 3,
      name: "Proxima Centauri b",
      hostStar: "Proxima Centauri",
      disposition: "Confirmed",
      radius: 1.1,
      mass: 1.3,
      orbitalPeriod: 11.2,
      temperature: 234,
      distance: 4.2,
      discoveryYear: 2016,
      method: "Radial Velocity",
      type: "Terrestrial",
      habitabilityScore: 72,
      description: "The closest exoplanet to Earth, orbiting within the habitable zone of our nearest stellar neighbor.",
      atmosphere: "Unknown",
      surfaceGravity: 1.1,
      stellarType: "M5.5Ve",
      composition: "Rocky",
      magneticField: "Uncertain"
    },
    {
      id: 4,
      name: "HD 209458 b",
      hostStar: "HD 209458",
      disposition: "Confirmed",
      radius: 1.38,
      mass: 0.69,
      orbitalPeriod: 3.5,
      temperature: 1130,
      distance: 159,
      discoveryYear: 1999,
      method: "Transit",
      type: "Hot Jupiter",
      habitabilityScore: 12,
      description: "The first exoplanet to have its atmosphere analyzed, showing water vapor and other compounds.",
      atmosphere: "Hydrogen/Helium with water vapor",
      surfaceGravity: 0.9,
      stellarType: "G0V",
      composition: "Gas Giant",
      magneticField: "Present"
    },
    {
      id: 5,
      name: "K2-18b",
      hostStar: "K2-18",
      disposition: "Confirmed",
      radius: 2.3,
      mass: 8.6,
      orbitalPeriod: 33,
      temperature: 265,
      distance: 124,
      discoveryYear: 2015,
      method: "Transit",
      type: "Sub-Neptune",
      habitabilityScore: 65,
      description: "Water vapor detected in its atmosphere, making it a prime target for habitability studies.",
      atmosphere: "Hydrogen-rich with water vapor",
      surfaceGravity: 2.3,
      stellarType: "M2.5V",
      composition: "Sub-Neptune",
      magneticField: "Likely"
    },
    {
      id: 6,
      name: "TOI-715b",
      hostStar: "TOI-715",
      disposition: "Confirmed",
      radius: 1.55,
      mass: 3.02,
      orbitalPeriod: 19.3,
      temperature: 280,
      distance: 137,
      discoveryYear: 2024,
      method: "Transit",
      type: "Super Earth",
      habitabilityScore: 81,
      description: "Recently discovered super-Earth in the habitable zone, optimal for atmospheric studies.",
      atmosphere: "Unknown",
      surfaceGravity: 1.9,
      stellarType: "M4V",
      composition: "Rocky",
      magneticField: "Unknown"
    },
    {
      id: 7,
      name: "GJ 667Cc",
      hostStar: "Gliese 667C",
      disposition: "Confirmed",
      radius: 1.5,
      mass: 3.8,
      orbitalPeriod: 28.1,
      temperature: 277,
      distance: 23.6,
      discoveryYear: 2011,
      method: "Radial Velocity",
      type: "Super Earth",
      habitabilityScore: 74,
      description: "Located in a triple star system, this planet receives stellar energy similar to Earth.",
      atmosphere: "Unknown",
      surfaceGravity: 1.7,
      stellarType: "M1.5V",
      composition: "Rocky",
      magneticField: "Unknown"
    },
    {
      id: 8,
      name: "Kepler-186f",
      hostStar: "Kepler-186",
      disposition: "Confirmed",
      radius: 1.11,
      mass: 1.44,
      orbitalPeriod: 129.9,
      temperature: 188,
      distance: 582,
      discoveryYear: 2014,
      method: "Transit",
      type: "Terrestrial",
      habitabilityScore: 68,
      description: "The first Earth-size planet found in the habitable zone of another star.",
      atmosphere: "Unknown",
      surfaceGravity: 1.2,
      stellarType: "M1V",
      composition: "Rocky",
      magneticField: "Unknown"
    },
    {
      id: 9,
      name: "LHS 1140b",
      hostStar: "LHS 1140",
      disposition: "Confirmed",
      radius: 1.7,
      mass: 6.6,
      orbitalPeriod: 24.7,
      temperature: 230,
      distance: 48.6,
      discoveryYear: 2017,
      method: "Transit",
      type: "Super Earth",
      habitabilityScore: 79,
      description: "Dense rocky planet that could retain an atmosphere in the habitable zone.",
      atmosphere: "Potentially retained",
      surfaceGravity: 3.1,
      stellarType: "M4.5V",
      composition: "Rocky",
      magneticField: "Likely"
    },
    {
      id: 10,
      name: "Wolf 1061c",
      hostStar: "Wolf 1061",
      disposition: "Confirmed",
      radius: 1.6,
      mass: 4.3,
      orbitalPeriod: 17.9,
      temperature: 223,
      distance: 13.8,
      discoveryYear: 2015,
      method: "Radial Velocity",
      type: "Super Earth",
      habitabilityScore: 66,
      description: "One of the closest potentially habitable exoplanets to Earth.",
      atmosphere: "Unknown",
      surfaceGravity: 2.0,
      stellarType: "M3V",
      composition: "Rocky",
      magneticField: "Unknown"
    },
    {
      id: 11,
      name: "55 Cancri e",
      hostStar: "55 Cancri A",
      disposition: "Confirmed",
      radius: 2.17,
      mass: 8.63,
      orbitalPeriod: 0.74,
      temperature: 2573,
      distance: 40.9,
      discoveryYear: 2004,
      method: "Radial Velocity",
      type: "Super Earth",
      habitabilityScore: 5,
      description: "A lava world so close to its star that its surface may be covered in molten rock.",
      atmosphere: "Likely absent",
      surfaceGravity: 2.3,
      stellarType: "G8V",
      composition: "Rocky/Lava",
      magneticField: "Unlikely"
    },
    {
      id: 12,
      name: "Kepler-442b",
      hostStar: "Kepler-442",
      disposition: "Confirmed",
      radius: 1.34,
      mass: 2.3,
      orbitalPeriod: 112.3,
      temperature: 233,
      distance: 1291,
      discoveryYear: 2015,
      method: "Transit",
      type: "Super Earth",
      habitabilityScore: 83,
      description: "A highly rated potentially habitable exoplanet with Earth-like conditions.",
      atmosphere: "Unknown",
      surfaceGravity: 1.4,
      stellarType: "K5V",
      composition: "Rocky",
      magneticField: "Unknown"
    }
  ];

  // Perform search with fuzzy matching
  const performSearch = (query, type) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const results = exoplanetDatabase.filter(planet => {
        const searchTerm = query.toLowerCase().trim();
        
        switch (type) {
          case 'name':
            return planet.name.toLowerCase().includes(searchTerm);
          case 'host':
            return planet.hostStar.toLowerCase().includes(searchTerm);
          case 'type':
            return planet.type.toLowerCase().includes(searchTerm);
          case 'all':
          default:
            return (
              planet.name.toLowerCase().includes(searchTerm) ||
              planet.hostStar.toLowerCase().includes(searchTerm) ||
              planet.type.toLowerCase().includes(searchTerm) ||
              planet.description.toLowerCase().includes(searchTerm) ||
              planet.stellarType.toLowerCase().includes(searchTerm)
            );
        }
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery, searchType);
  };

  const getHabitabilityColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHabitabilityBadge = (score) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <motion.div 
        className="glass-panel rounded-2xl p-8 border border-gradient-red-400/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 nasa-title">🔍 Exoplanet Database Search</h2>
          <p className="text-white/80 max-w-3xl mx-auto">
            Search our comprehensive database of confirmed exoplanets. Find detailed information about any 
            planet by name, host star, type, or general search.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Type Selector */}
            <div className="md:w-48">
              <label className="block text-white/70 text-sm mb-2">Search By</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gradient-red-400/30 rounded-xl text-white focus:border-gradient-red-400/60 focus:outline-none transition-all"
              >
                <option value="all">All Fields</option>
                <option value="name">Planet Name</option>
                <option value="host">Host Star</option>
                <option value="type">Planet Type</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-white/70 text-sm mb-2">Search Query</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter planet name, host star, or keywords..."
                  className="w-full px-4 py-3 pr-12 bg-black/50 border border-gradient-red-400/30 rounded-xl text-white placeholder-white/50 focus:border-gradient-red-400/60 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gradient-red-400 hover:text-gradient-red-300 transition-colors disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="animate-spin w-5 h-5 border-2 border-gradient-red-400 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-white/60 text-sm mr-2">Quick searches:</span>
            {['Kepler-452b', 'TRAPPIST-1', 'Proxima', 'Super Earth', 'Transit'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setSearchQuery(suggestion);
                  performSearch(suggestion, searchType);
                }}
                className="px-3 py-1 bg-gradient-red-500/20 border border-gradient-red-400/30 rounded-lg text-gradient-red-300 text-sm hover:bg-gradient-red-500/30 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">
                Found {searchResults.length} exoplanet{searchResults.length !== 1 ? 's' : ''}
              </h3>
              <div className="text-white/60 text-sm">
                Searching for: "{searchQuery}" in {searchType === 'all' ? 'all fields' : searchType}
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {searchResults.map((planet, index) => (
                <motion.div
                  key={planet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel rounded-2xl p-6 border border-gradient-red-400/30 hover:border-gradient-red-400/60 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedExoplanet(planet)}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Planet Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{planet.name}</h4>
                      <p className="text-gradient-red-300 text-sm">Orbits {planet.hostStar}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getHabitabilityBadge(planet.habitabilityScore)}`}>
                      {planet.habitabilityScore}% Habitable
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-gradient-red-300 font-bold">{planet.distance.toFixed(1)}</div>
                      <div className="text-white/60 text-xs">Light Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gradient-red-300 font-bold">{planet.radius.toFixed(1)}x</div>
                      <div className="text-white/60 text-xs">Earth Radius</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gradient-red-300 font-bold">{planet.discoveryYear}</div>
                      <div className="text-white/60 text-xs">Discovered</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {planet.description}
                  </p>

                  {/* Planet Type and Method */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 bg-gradient-red-500/20 text-gradient-red-300 rounded">
                      {planet.type}
                    </span>
                    <span className="text-white/60">
                      Found via {planet.method}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-8 border border-gradient-red-400/30 text-center"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-4">No Results Found</h3>
          <p className="text-white/70 mb-6">
            No exoplanets found matching "{searchQuery}". Try different keywords or search terms.
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <p>• Check spelling of planet or star names</p>
            <p>• Try broader search terms like "Kepler" or "super earth"</p>
            <p>• Use the quick search suggestions above</p>
          </div>
        </motion.div>
      )}

      {/* Detailed Planet Modal */}
      <AnimatePresence>
        {selectedExoplanet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExoplanet(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-panel rounded-2xl p-8 border border-gradient-red-400/40 max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedExoplanet.name}</h2>
                  <p className="text-gradient-red-300">Host Star: {selectedExoplanet.hostStar}</p>
                </div>
                <button
                  onClick={() => setSelectedExoplanet(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Planet Details Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Physical Properties */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Physical Properties</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Type:</span>
                        <span className="text-white font-medium">{selectedExoplanet.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Radius:</span>
                        <span className="text-white font-medium">{selectedExoplanet.radius} Earth radii</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Mass:</span>
                        <span className="text-white font-medium">{selectedExoplanet.mass} Earth masses</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Surface Gravity:</span>
                        <span className="text-white font-medium">{selectedExoplanet.surfaceGravity}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Composition:</span>
                        <span className="text-white font-medium">{selectedExoplanet.composition}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Orbital Properties</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Orbital Period:</span>
                        <span className="text-white font-medium">{selectedExoplanet.orbitalPeriod} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Temperature:</span>
                        <span className="text-white font-medium">{selectedExoplanet.temperature} K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Distance from Earth:</span>
                        <span className="text-white font-medium">{selectedExoplanet.distance} light-years</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Discovery and Environment */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Discovery Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Discovery Year:</span>
                        <span className="text-white font-medium">{selectedExoplanet.discoveryYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Detection Method:</span>
                        <span className="text-white font-medium">{selectedExoplanet.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Status:</span>
                        <span className="text-green-400 font-medium">{selectedExoplanet.disposition}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Environment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Host Star Type:</span>
                        <span className="text-white font-medium">{selectedExoplanet.stellarType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Atmosphere:</span>
                        <span className="text-white font-medium">{selectedExoplanet.atmosphere}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Magnetic Field:</span>
                        <span className="text-white font-medium">{selectedExoplanet.magneticField}</span>
                      </div>
                    </div>
                  </div>

                  {/* Habitability Score */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Habitability Assessment</h3>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${getHabitabilityColor(selectedExoplanet.habitabilityScore)}`}>
                        {selectedExoplanet.habitabilityScore}%
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-3 mb-4">
                        <div
                          className={`h-full rounded-full ${
                            selectedExoplanet.habitabilityScore >= 80 ? 'bg-green-400' :
                            selectedExoplanet.habitabilityScore >= 60 ? 'bg-yellow-400' :
                            selectedExoplanet.habitabilityScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${selectedExoplanet.habitabilityScore}%` }}
                        />
                      </div>
                      <p className="text-white/70 text-sm">
                        {selectedExoplanet.habitabilityScore >= 80 ? 'Highly Habitable' :
                         selectedExoplanet.habitabilityScore >= 60 ? 'Potentially Habitable' :
                         selectedExoplanet.habitabilityScore >= 40 ? 'Marginally Habitable' : 'Unlikely Habitable'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 pt-6 border-t border-gradient-red-400/20">
                <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                <p className="text-white/80 leading-relaxed">
                  {selectedExoplanet.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExoplanetSearch;