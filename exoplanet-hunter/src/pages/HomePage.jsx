import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import ExoplanetSearch from '../components/ui/ExoplanetSearch';

const HomePage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Mouse parallax for subtle effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / window.innerWidth,
        y: (e.clientY - window.innerHeight / 2) / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Typewriter effect
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Powered by NASA • Discover the mysteries of distant worlds...";

  useEffect(() => {
    let i = 0;
    const typeWriter = () => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
        setTimeout(typeWriter, 100);
      }
    };
    typeWriter();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative"
    >
      {/* Background Effects Layer */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
        }}
      >
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20 z-10">
        <motion.div 
          className="text-center z-10 max-w-4xl mx-auto px-8"
          style={{ y: y1, opacity }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight nasa-title text-glow"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Exopedia
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/80 mb-8 font-space font-light h-10 space-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            {displayedText}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <Link to="/explore">
              <motion.button 
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-display font-bold text-base rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                Start Exploring
              </motion.button>
            </Link>
            
            <Link to="/upload">
              <motion.button 
                className="px-8 py-4 border-2 border-cyan-400 glass-button text-white font-display font-bold text-base rounded-xl backdrop-blur-sm hover:bg-cyan-500/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Upload Data
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Exoplanet Search Section */}
      <section className="min-h-screen flex items-center justify-center px-8 relative">
        <motion.div 
          className="max-w-7xl mx-auto w-full"
          style={{ y: y2 }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <ExoplanetSearch />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen flex items-center justify-center px-8 relative">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          style={{ y: y2 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-display font-bold text-white mb-12 nasa-title text-glow"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Explore the Universe
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="glass-panel rounded-2xl p-6 border border-cyan-400/30 hover:border-cyan-300/50 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 nasa-title">Interactive 3D</h3>
              <p className="text-white/80 leading-relaxed text-sm font-space">
                Explore exoplanets in stunning 3D environments with realistic physics and orbital mechanics.
              </p>
            </motion.div>

            <motion.div 
              className="glass-panel rounded-2xl p-6 border border-purple-400/30 hover:border-purple-300/50 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 nasa-title">AI Predictions</h3>
              <p className="text-white/80 leading-relaxed text-sm font-space">
                Upload exoplanet data and get AI-powered habitability predictions with confidence scores and detailed analysis.
              </p>
            </motion.div>

            <motion.div 
              className="glass-panel rounded-2xl p-6 border border-gradient-cyan-400/30"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-gradient-cyan-400 to-gradient-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-xl">�</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 nasa-title">Exoplanet Search</h3>
              <p className="text-white/80 leading-relaxed text-sm font-space">
                Search our comprehensive database of confirmed exoplanets by name, host star, or characteristics.
              </p>
            </motion.div>

            <motion.div 
              className="glass-panel rounded-2xl p-6 border border-indigo-400/30 hover:border-indigo-300/50 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 nasa-title">Data Analytics</h3>
              <p className="text-white/80 leading-relaxed text-sm font-space">
                Comprehensive statistical dashboards with interactive charts and visualizations.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="min-h-screen flex items-center justify-center px-8 relative">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          style={{ y: y2 }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8 nasa-title text-glow">
            Ready to Discover?
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed font-space space-text">
            Join thousands of citizen scientists in the search for new worlds. 
            Every discovery brings us closer to answering the ultimate question: Are we alone?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/explore">
              <motion.button 
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-display font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                Begin Your Journey
              </motion.button>
            </Link>
            
            <Link to="/about">
              <motion.button 
                className="px-10 py-4 border-2 border-cyan-400 glass-button text-white font-display font-bold text-lg rounded-xl backdrop-blur-sm hover:bg-cyan-500/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;