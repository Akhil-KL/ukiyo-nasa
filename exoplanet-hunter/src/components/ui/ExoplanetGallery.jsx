import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExoplanetGallery = ({ onPlanetSelect, selectedPlanet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDisposition, setFilterDisposition] = useState('all');
  const [radiusRange, setRadiusRange] = useState([0, 10]);
  const [temperatureRange, setTemperatureRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced exoplanet data with more details
  const exoplanets = [
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
      stellarType: "G2V"
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
      stellarType: "M8V"
    },
    {
      id: 3,
      name: "Proxima Centauri b",
      hostStar: "Proxima Centauri",
      disposition: "Confirmed",
      radius: 1.1,
      mass: 1.17,
      orbitalPeriod: 11.2,
      temperature: 234,
      distance: 4.24,
      discoveryYear: 2016,
      method: "Radial Velocity",
      type: "Terrestrial",
      habitabilityScore: 72,
      description: "The closest known exoplanet to Earth, orbiting our nearest stellar neighbor.",
      atmosphere: "Unknown",
      surfaceGravity: 1.07,
      stellarType: "M5.5V"
    },
    {
      id: 4,
      name: "HD 209458 b",
      hostStar: "HD 209458",
      disposition: "Confirmed",
      radius: 1.4,
      mass: 0.69,
      orbitalPeriod: 3.5,
      temperature: 1130,
      distance: 159,
      discoveryYear: 1999,
      method: "Transit",
      type: "Hot Jupiter",
      habitabilityScore: 12,
      description: "The first exoplanet discovered transiting its star, revolutionizing exoplanet science.",
      atmosphere: "H₂/He with clouds",
      surfaceGravity: 0.4,
      stellarType: "G0V"
    },
    {
      id: 5,
      name: "K2-18 b",
      hostStar: "K2-18",
      disposition: "Confirmed",
      radius: 2.3,
      mass: 8.6,
      orbitalPeriod: 32.9,
      temperature: 279,
      distance: 124,
      discoveryYear: 2015,
      method: "Transit",
      type: "Sub-Neptune",
      habitabilityScore: 65,
      description: "A potentially habitable world with detected water vapor in its atmosphere.",
      atmosphere: "H₂O detected",
      surfaceGravity: 2.3,
      stellarType: "M2.5V"
    },
    {
      id: 6,
      name: "TOI-715 b",
      hostStar: "TOI-715",
      disposition: "Confirmed",
      radius: 1.55,
      mass: 3.02,
      orbitalPeriod: 19.3,
      temperature: 300,
      distance: 137,
      discoveryYear: 2024,
      method: "Transit",
      type: "Super Earth",
      habitabilityScore: 81,
      description: "A recently discovered world in the conservative habitable zone of its star.",
      atmosphere: "Unknown",
      surfaceGravity: 1.26,
      stellarType: "M1V"
    },
    {
      id: 7,
      name: "Kepler-442b",
      hostStar: "Kepler-442",
      disposition: "Confirmed",
      radius: 1.34,
      mass: 2.3,
      orbitalPeriod: 112.3,
      temperature: 233,
      distance: 1206,
      discoveryYear: 2015,
      method: "Transit",
      type: "Super Earth",
      habitabilityScore: 88,
      description: "One of the most Earth-like planets discovered, with excellent habitability potential.",
      atmosphere: "Unknown",
      surfaceGravity: 1.3,
      stellarType: "K0V"
    },
    {
      id: 8,
      name: "Gliese 667Cc",
      hostStar: "Gliese 667C",
      disposition: "Confirmed",
      radius: 1.54,
      mass: 3.7,
      orbitalPeriod: 28.1,
      temperature: 277,
      distance: 23.6,
      discoveryYear: 2011,
      method: "Radial Velocity",
      type: "Super Earth",
      habitabilityScore: 84,
      description: "Located in the habitable zone of a red dwarf star in a triple star system.",
      atmosphere: "Unknown",
      surfaceGravity: 1.6,
      stellarType: "M1.5V"
    },
    {
      id: 9,
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
      habitabilityScore: 71,
      description: "A potentially rocky world orbiting within the habitable zone of a nearby red dwarf.",
      atmosphere: "Unknown",
      surfaceGravity: 1.7,
      stellarType: "M3V"
    },
    {
      id: 10,
      name: "LHS 1140 b",
      hostStar: "LHS 1140",
      disposition: "Confirmed",
      radius: 1.7,
      mass: 6.6,
      orbitalPeriod: 24.7,
      temperature: 230,
      distance: 40.7,
      discoveryYear: 2017,
      method: "Transit",
      type: "Super Earth",
      habitabilityScore: 89,
      description: "A dense rocky world that may have retained its atmosphere better than most.",
      atmosphere: "Potentially thick",
      surfaceGravity: 2.3,
      stellarType: "M4.5V"
    },
    {
      id: 11,
      name: "Kepler-1649c",
      hostStar: "Kepler-1649",
      disposition: "Confirmed",
      radius: 1.06,
      mass: 1.2,
      orbitalPeriod: 19.5,
      temperature: 234,
      distance: 300,
      discoveryYear: 2020,
      method: "Transit",
      type: "Terrestrial",
      habitabilityScore: 92,
      description: "The most Earth-size planet found in the habitable zone of another star.",
      atmosphere: "Unknown",
      surfaceGravity: 1.07,
      stellarType: "M5V"
    },
    {
      id: 12,
      name: "Ross 128 b",
      hostStar: "Ross 128",
      disposition: "Confirmed",
      radius: 1.1,
      mass: 1.35,
      orbitalPeriod: 9.9,
      temperature: 269,
      distance: 11.0,
      discoveryYear: 2017,
      method: "Radial Velocity",
      type: "Terrestrial",
      habitabilityScore: 78,
      description: "Orbits a quiet red dwarf star, making it potentially more habitable.",
      atmosphere: "Unknown",
      surfaceGravity: 1.1,
      stellarType: "M4V"
    }
  ];

  // Filter and sort planets
  const filteredAndSortedPlanets = useMemo(() => {
    let filtered = exoplanets.filter(planet => {
      const matchesSearch = planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          planet.hostStar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          planet.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDisposition = filterDisposition === 'all' || 
                                planet.disposition.toLowerCase() === filterDisposition.toLowerCase();
      
      const matchesRadius = planet.radius >= radiusRange[0] && planet.radius <= radiusRange[1];
      const matchesTemperature = planet.temperature >= temperatureRange[0] && planet.temperature <= temperatureRange[1];
      
      return matchesSearch && matchesDisposition && matchesRadius && matchesTemperature;
    });

    // Sort planets
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'radius':
          aValue = a.radius;
          bValue = b.radius;
          break;
        case 'distance':
          aValue = a.distance;
          bValue = b.distance;
          break;
        case 'temperature':
          aValue = a.temperature;
          bValue = b.temperature;
          break;
        case 'habitability':
          aValue = a.habitabilityScore;
          bValue = b.habitabilityScore;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, sortOrder, filterDisposition, radiusRange, temperatureRange]);

  // Get status badge color
  const getStatusBadgeColor = (disposition, habitabilityScore) => {
    if (disposition === 'Confirmed') {
      if (habitabilityScore >= 80) return 'from-green-500 to-emerald-600';
      if (habitabilityScore >= 60) return 'from-yellow-500 to-orange-500';
      return 'from-blue-500 to-indigo-600';
    }
    return 'from-gray-500 to-gray-600';
  };

  // Get habitability color
  const getHabitabilityColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Search and Filter Controls */}
      <motion.div 
        className="card-enhanced space-y-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search planets, host stars, or types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/70 border border-gradient-red-400/40 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/60 focus:border-gradient-red-300 focus:outline-none transition-colors font-space"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-xl">🔍</span>
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/70 border border-gradient-red-400/40 rounded-xl px-4 py-3 text-white focus:border-gradient-red-300 focus:outline-none transition-colors font-space"
            >
              <option value="name">Sort by Name</option>
              <option value="radius">Sort by Radius</option>
              <option value="distance">Sort by Distance</option>
              <option value="temperature">Sort by Temperature</option>
              <option value="habitability">Sort by Habitability</option>
            </select>
            
            <motion.button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-gradient-red-500/20 border border-gradient-red-400/40 rounded-xl px-4 py-3 text-white hover:bg-gradient-red-500/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </motion.button>
            
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gradient-red-500/20 border border-gradient-red-400/40 rounded-xl px-4 py-3 text-white hover:bg-gradient-red-500/30 transition-colors font-space"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Filters {showFilters ? '▲' : '▼'}
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gradient-red-400/20 pt-6 space-y-4"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Disposition Filter */}
                <div>
                  <label className="block text-white/80 font-space text-sm mb-2">Status</label>
                  <select
                    value={filterDisposition}
                    onChange={(e) => setFilterDisposition(e.target.value)}
                    className="w-full bg-black/70 border border-gradient-red-400/40 rounded-xl px-4 py-2 text-white focus:border-gradient-red-300 focus:outline-none transition-colors font-space"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="candidate">Candidate</option>
                  </select>
                </div>

                {/* Radius Range */}
                <div>
                  <label className="block text-white/80 font-space text-sm mb-2">
                    Radius Range: {radiusRange[0]}x - {radiusRange[1]}x Earth
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={radiusRange[0]}
                      onChange={(e) => setRadiusRange([parseFloat(e.target.value), radiusRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={radiusRange[1]}
                      onChange={(e) => setRadiusRange([radiusRange[0], parseFloat(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Temperature Range */}
                <div>
                  <label className="block text-white/80 font-space text-sm mb-2">
                    Temperature: {temperatureRange[0]}K - {temperatureRange[1]}K
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="10"
                      value={temperatureRange[0]}
                      onChange={(e) => setTemperatureRange([parseInt(e.target.value), temperatureRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="10"
                      value={temperatureRange[1]}
                      onChange={(e) => setTemperatureRange([temperatureRange[0], parseInt(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Summary */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-display font-bold text-white nasa-title">
          {filteredAndSortedPlanets.length} Exoplanet{filteredAndSortedPlanets.length !== 1 ? 's' : ''} Found
        </h3>
        <div className="flex gap-2 text-sm text-white/60 font-space">
          <span>🌍 {filteredAndSortedPlanets.filter(p => p.type === 'Terrestrial').length} Terrestrial</span>
          <span>🔥 {filteredAndSortedPlanets.filter(p => p.type.includes('Jupiter')).length} Gas Giants</span>
          <span>⭐ {filteredAndSortedPlanets.filter(p => p.type === 'Super Earth').length} Super Earths</span>
        </div>
      </motion.div>

      {/* Planet Grid */}
      <motion.div 
        className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredAndSortedPlanets.map((planet, index) => (
          <motion.div
            key={planet.id}
            variants={cardVariants}
            className={`card-enhanced cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedPlanet?.id === planet.id ? 'ring-2 ring-gradient-red-400' : ''
            }`}
            onClick={() => onPlanetSelect(planet)}
            whileHover={{ y: -5 }}
          >
            {/* Planet Preview Area */}
            <div className="relative h-32 mb-4 bg-gradient-to-br from-black/40 to-gradient-red-900/20 rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className={`w-16 h-16 rounded-full animate-pulse ${
                    planet.type === 'Hot Jupiter' ? 'bg-gradient-to-br from-orange-400 to-red-600' :
                    planet.type === 'Terrestrial' ? 'bg-gradient-to-br from-blue-400 to-green-500' :
                    planet.type === 'Super Earth' ? 'bg-gradient-to-br from-green-400 to-blue-500' :
                    'bg-gradient-to-br from-purple-400 to-pink-500'
                  }`}
                  style={{
                    transform: `scale(${Math.min(planet.radius / 2, 1)})`,
                  }}
                />
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r ${getStatusBadgeColor(planet.disposition, planet.habitabilityScore)}`}>
                  {planet.disposition}
                </span>
              </div>

              {/* Habitability Score */}
              <div className="absolute bottom-3 left-3">
                <div className={`text-sm font-bold ${getHabitabilityColor(planet.habitabilityScore)}`}>
                  {planet.habitabilityScore}% Habitable
                </div>
              </div>
            </div>

            {/* Planet Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-display font-bold text-white nasa-title truncate">
                  {planet.name}
                </h3>
                <p className="text-gradient-red-300 font-space text-sm">
                  Host: {planet.hostStar}
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/40 rounded-lg p-2">
                  <div className="text-white/60 font-space">Radius</div>
                  <div className="text-white font-semibold">{planet.radius}× Earth</div>
                </div>
                <div className="bg-black/40 rounded-lg p-2">
                  <div className="text-white/60 font-space">Period</div>
                  <div className="text-white font-semibold">{planet.orbitalPeriod}d</div>
                </div>
                <div className="bg-black/40 rounded-lg p-2">
                  <div className="text-white/60 font-space">Temp</div>
                  <div className="text-white font-semibold">{planet.temperature}K</div>
                </div>
                <div className="bg-black/40 rounded-lg p-2">
                  <div className="text-white/60 font-space">Distance</div>
                  <div className="text-white font-semibold">{planet.distance}ly</div>
                </div>
              </div>

              {/* Planet Type */}
              <div className="flex justify-between items-center">
                <span className="text-gradient-red-400 font-space text-sm font-medium">
                  {planet.type}
                </span>
                <span className="text-white/60 font-space text-xs">
                  {planet.discoveryYear}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {filteredAndSortedPlanets.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-6xl mb-4">🔭</div>
          <h3 className="text-2xl font-display font-bold text-white nasa-title mb-2">
            No Exoplanets Found
          </h3>
          <p className="text-white/60 font-space">
            Try adjusting your search criteria or filters to discover more worlds.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ExoplanetGallery;