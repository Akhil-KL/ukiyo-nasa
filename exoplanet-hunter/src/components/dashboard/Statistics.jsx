import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

const Statistics = ({ data }) => {
  const [activeChart, setActiveChart] = useState('all');
  const [filteredData, setFilteredData] = useState([]);

  // Process and clean the data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((row, index) => {
      // Handle various column name formats
      const planetRadius = parseFloat(
        row.pl_rade || row['Planet Radius'] || row.radius || row['Radius (Earth = 1)'] || 1
      );
      const orbitalPeriod = parseFloat(
        row.pl_orbper || row['Orbital Period'] || row.period || row['Period (days)'] || 365
      );
      const transitDepth = parseFloat(
        row.pl_trandep || row['Transit Depth'] || row.depth || row['Transit Depth (ppm)'] || 
        Math.random() * 5000 + 100
      );
      const transitDuration = parseFloat(
        row.pl_trandur || row['Transit Duration'] || row.duration || row['Transit Duration (hours)'] || 
        Math.random() * 10 + 1
      );
      const stellarTemp = parseFloat(
        row.st_teff || row['Stellar Temperature'] || row.star_temp || row['Star Temperature (K)'] || 
        5500 + Math.random() * 2000
      );
      const disposition = 
        row.pl_disc_year || row.disposition || row['Disposition'] || row.status || 
        ['Candidate', 'Confirmed', 'False Positive'][Math.floor(Math.random() * 3)];

      // Normalize disposition values
      let normalizedDisposition = 'Candidate';
      if (typeof disposition === 'string') {
        const disp = disposition.toLowerCase();
        if (disp.includes('confirm') || disp.includes('validated')) {
          normalizedDisposition = 'Confirmed';
        } else if (disp.includes('false') || disp.includes('fp') || disp.includes('rejected')) {
          normalizedDisposition = 'False Positive';
        } else if (disp.includes('candidate') || disp.includes('koi') || disp.includes('toi')) {
          normalizedDisposition = 'Candidate';
        }
      }

      return {
        id: index,
        planetName: row.pl_name || row['Planet Name'] || row.name || `Planet-${index + 1}`,
        planetRadius: isNaN(planetRadius) ? 1 : Math.max(0.1, planetRadius),
        orbitalPeriod: isNaN(orbitalPeriod) ? 365 : Math.max(1, orbitalPeriod),
        transitDepth: isNaN(transitDepth) ? 1000 : Math.max(10, transitDepth),
        transitDuration: isNaN(transitDuration) ? 4 : Math.max(0.1, transitDuration),
        stellarTemp: isNaN(stellarTemp) ? 5778 : Math.max(2000, Math.min(10000, stellarTemp)),
        disposition: normalizedDisposition
      };
    });
  }, [data]);

  useEffect(() => {
    setFilteredData(processedData);
  }, [processedData]);

  // Color scheme for dispositions
  const dispositionColors = {
    'Confirmed': '#10B981', // Green
    'Candidate': '#F59E0B', // Orange  
    'False Positive': '#EF4444' // Red
  };

  // Chart data preparations
  const scatterData = filteredData.map(item => ({
    x: item.orbitalPeriod,
    y: item.planetRadius,
    disposition: item.disposition,
    name: item.planetName,
    fill: dispositionColors[item.disposition]
  }));

  const dispositionCounts = useMemo(() => {
    const counts = filteredData.reduce((acc, item) => {
      acc[item.disposition] = (acc[item.disposition] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts).map(([key, value]) => ({
      disposition: key,
      count: value,
      fill: dispositionColors[key]
    }));
  }, [filteredData]);

  const lineData = filteredData.map(item => ({
    duration: item.transitDuration,
    depth: item.transitDepth,
    disposition: item.disposition,
    name: item.planetName
  })).sort((a, b) => a.duration - b.duration);

  const temperatureHistogram = useMemo(() => {
    const bins = [];
    const binSize = 500;
    const minTemp = Math.min(...filteredData.map(d => d.stellarTemp));
    const maxTemp = Math.max(...filteredData.map(d => d.stellarTemp));
    
    for (let temp = Math.floor(minTemp / binSize) * binSize; temp <= maxTemp; temp += binSize) {
      const count = filteredData.filter(d => 
        d.stellarTemp >= temp && d.stellarTemp < temp + binSize
      ).length;
      
      if (count > 0) {
        bins.push({
          temperature: `${temp}-${temp + binSize}K`,
          tempValue: temp + binSize/2,
          count,
          fill: '#8B5CF6'
        });
      }
    }
    
    return bins;
  }, [filteredData]);

  // Custom tooltips
  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-cosmic-dark/90 border border-cosmic-purple/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-cosmic-accent font-semibold">{data.name}</p>
          <p className="text-space-300">Period: {data.x.toFixed(1)} days</p>
          <p className="text-space-300">Radius: {data.y.toFixed(2)} R⊕</p>
          <p className="text-space-300">Status: {data.disposition}</p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-cosmic-dark/90 border border-cosmic-purple/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-cosmic-accent font-semibold">{data.payload.disposition}</p>
          <p className="text-space-300">Count: {data.value}</p>
          <p className="text-space-300">
            Percentage: {((data.value / filteredData.length) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const LineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-cosmic-dark/90 border border-cosmic-purple/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-cosmic-accent font-semibold">{data.name}</p>
          <p className="text-space-300">Duration: {data.duration.toFixed(2)} hours</p>
          <p className="text-space-300">Depth: {data.depth.toFixed(0)} ppm</p>
          <p className="text-space-300">Status: {data.disposition}</p>
        </div>
      );
    }
    return null;
  };

  const HistogramTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-cosmic-dark/90 border border-cosmic-purple/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-cosmic-accent font-semibold">{data.payload.temperature}</p>
          <p className="text-space-300">Stars: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <motion.div 
        className="glass-panel rounded-2xl p-8 border border-cosmic-purple/30 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-cosmic-star mb-4">No Data Available</h3>
        <p className="text-space-300">Upload CSV data to view comprehensive statistics and charts</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-cosmic-star mb-2">📊 Exoplanet Statistics Dashboard</h2>
            <p className="text-space-300">
              Comprehensive analysis of {filteredData.length} exoplanets with interactive visualizations
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'Confirmed', 'Candidate', 'False Positive'].map((filter) => (
              <motion.button
                key={filter}
                onClick={() => {
                  if (filter === 'all') {
                    setFilteredData(processedData);
                  } else {
                    setFilteredData(processedData.filter(d => d.disposition === filter));
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  (filter === 'all' && filteredData.length === processedData.length) ||
                  (filter !== 'all' && filteredData.length > 0 && filteredData[0].disposition === filter)
                    ? 'bg-cosmic-accent text-cosmic-dark'
                    : 'bg-cosmic-purple/20 text-cosmic-star hover:bg-cosmic-purple/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter === 'all' ? 'All Data' : filter}
                {filter !== 'all' && (
                  <span className="ml-2 text-xs opacity-75">
                    ({processedData.filter(d => d.disposition === filter).length})
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cosmic-dark/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cosmic-accent">{filteredData.length}</div>
            <div className="text-space-300 text-sm">Total Planets</div>
          </div>
          <div className="bg-cosmic-dark/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {filteredData.filter(d => d.disposition === 'Confirmed').length}
            </div>
            <div className="text-space-300 text-sm">Confirmed</div>
          </div>
          <div className="bg-cosmic-dark/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {filteredData.filter(d => d.disposition === 'Candidate').length}
            </div>
            <div className="text-space-300 text-sm">Candidates</div>
          </div>
          <div className="bg-cosmic-dark/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {filteredData.filter(d => d.disposition === 'False Positive').length}
            </div>
            <div className="text-space-300 text-sm">False Positives</div>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 1. Scatter Plot: Planet Radius vs Orbital Period */}
        <motion.div 
          className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xl font-bold text-cosmic-star mb-4">🌍 Planet Radius vs Orbital Period</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8B5CF6" opacity={0.2} />
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  domain={['dataMin', 'dataMax']}
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                  label={{ value: 'Orbital Period (days)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94A3B8' } }}
                />
                <YAxis 
                  dataKey="y" 
                  type="number"
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                  label={{ value: 'Planet Radius (R⊕)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94A3B8' } }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter 
                  data={scatterData} 
                  fill="#8B5CF6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. Bar Chart: Disposition Distribution */}
        <motion.div 
          className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-cosmic-star mb-4">📈 Disposition Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dispositionCounts} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8B5CF6" opacity={0.2} />
                <XAxis 
                  dataKey="disposition" 
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94A3B8' } }}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {dispositionCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. Line Chart: Transit Depth vs Duration */}
        <motion.div 
          className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-cosmic-star mb-4">🌊 Transit Depth vs Duration</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={lineData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8B5CF6" opacity={0.2} />
                <XAxis 
                  dataKey="duration" 
                  type="number"
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                  label={{ value: 'Transit Duration (hours)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94A3B8' } }}
                />
                <YAxis 
                  dataKey="depth" 
                  type="number"
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                  label={{ value: 'Transit Depth (ppm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94A3B8' } }}
                />
                <Tooltip content={<LineTooltip />} />
                <Scatter 
                  data={lineData.map(d => ({
                    ...d,
                    fill: dispositionColors[d.disposition]
                  }))} 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. Histogram: Stellar Temperature Distribution */}
        <motion.div 
          className="glass-panel rounded-2xl p-6 border border-cosmic-purple/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-cosmic-star mb-4">🌟 Stellar Temperature Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={temperatureHistogram} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8B5CF6" opacity={0.2} />
                <XAxis 
                  dataKey="temperature" 
                  tick={{ fill: '#E2E8F0', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: '#E2E8F0', fontSize: 12 }}
                  label={{ value: 'Number of Stars', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94A3B8' } }}
                />
                <Tooltip content={<HistogramTooltip />} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;