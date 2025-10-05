import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import NASALogo from '../ui/NASALogo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Explore', path: '/explore', icon: '🌍' },
    { name: 'Upload', path: '/upload', icon: '📊' },
    { name: 'Statistics', path: '/statistics', icon: '📈' },
    { name: 'About', path: '/about', icon: '👥' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-8 py-4 sm:py-6 backdrop-blur-md bg-cosmic-dark/30 border-b border-cosmic-purple/10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center p-1 shadow-lg shadow-blue-500/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <NASALogo className="w-full h-full" />
          </motion.div>
          <motion.h1 
            className="text-2xl font-bold text-cosmic-star tracking-tight group-hover:text-cosmic-accent transition-colors duration-200 nasa-title"
            whileHover={{ scale: 1.02 }}
          >
            Exopedia
          </motion.h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-cosmic-accent/20 text-cosmic-accent border border-cosmic-accent/30'
                    : 'text-space-300 hover:text-cosmic-star hover:bg-cosmic-purple/10 border border-transparent'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 text-cosmic-star hover:text-cosmic-accent transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <motion.div 
              className="w-full h-0.5 bg-current"
              animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }}
            />
            <motion.div 
              className="w-full h-0.5 bg-current"
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
            />
            <motion.div 
              className="w-full h-0.5 bg-current"
              animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}
            />
          </div>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden"
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <nav className="pt-4 pb-2 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.div
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
                  isActive(item.path)
                    ? 'bg-cosmic-accent/20 text-cosmic-accent border border-cosmic-accent/30'
                    : 'text-space-300 hover:text-cosmic-star hover:bg-cosmic-purple/10'
                }`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </motion.div>
            </Link>
          ))}
        </nav>
      </motion.div>
    </header>
  );
};

export default Navbar;