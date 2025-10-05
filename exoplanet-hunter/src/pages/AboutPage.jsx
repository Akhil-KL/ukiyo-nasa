import React from 'react';
import { motion } from 'framer-motion';
import EducationalAccordion from '../components/ui/EducationalAccordion';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Gaurav Mishra",
      role: "Team Lead",
      bio: "Leading my team members to acheive goal and reach the new heights of Creativity",
      image: "👩‍🔬"
    },
    {
      name: "Akhil Kumar Lohar",
      role: "Supervisor",
      bio: "Inni meeni maaini mo",
      image: "👨‍💻"
    },
    {
      name: "Vishnu Vardan",
      role: "Backend Developer",
      bio: "Handles server-side logic, database management, and API integrations to ensure smooth data flow.",
      image: "👨‍💻"
    },
    {
      name: "Nand Nandan",
      role: "Frontend Developer",
      bio: "Crafts intuitive user interfaces and ensures a seamless user experience across the platform.",
      image: "👩‍🔬"
    },
    {
      name: "Pranay Deep",
      role: "Developer/Tester",
      bio: "Ensures code quality through rigorous testing and debugging, contributing to a robust application.",
      image: "👨‍💻"
    },
    {
      name: "Nikhil Raj B",
      role: "Backup Operator",
      bio: "Ensures data integrity and system reliability through regular backups and maintenance tasks.",
      image: "👨‍💻"
    }
  ];

  const milestones = [
    {
      year: "1995",
      title: "First Exoplanet Discovery",
      description: "51 Eridani b, the first exoplanet orbiting a main-sequence star, was discovered using the radial velocity method."
    },
    {
      year: "2009",
      title: "Kepler Space Telescope",
      description: "NASA's Kepler mission launched, revolutionizing exoplanet discovery through the transit method."
    },
    {
      year: "2018",
      title: "TESS Mission",
      description: "The Transiting Exoplanet Survey Satellite began its all-sky survey for nearby exoplanets."
    },
    {
      year: "2021",
      title: "James Webb Space Telescope",
      description: "JWST launched, enabling detailed atmospheric analysis of exoplanets for the first time."
    }
  ];

  return (
    <div className="relative pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-12">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 nasa-title">
            About
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-cyan-400 to-gradient-blue-600 block">
              Our Mission
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Powered by NASA data and technology, democratizing exoplanet discovery through cutting-edge visualization and citizen science.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div 
          className="glass-panel rounded-2xl p-8 mb-16 border border-gradient-cyan-400/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Powered by NASA's extensive exoplanet databases and cutting-edge research, we believe that the search for life beyond Earth is one of humanity's greatest quests. 
                Our platform makes official NASA exoplanet data accessible to everyone, from professional astronomers 
                to curious students, enabling collaborative discovery on an unprecedented scale.
              </p>
              <p className="text-white/80 leading-relaxed">
                By combining interactive 3D visualization with powerful data analysis tools and NASA's trusted datasets, 
                we're creating a new generation of citizen scientists who can contribute 
                meaningfully to the field of exoplanet research using authentic space agency data.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-cyan-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-2xl">🌍</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Accessibility</h3>
                  <p className="text-white/70 text-sm">Making complex astronomical data understandable for everyone.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Collaboration</h3>
                  <p className="text-white/70 text-sm">Fostering global collaboration in scientific discovery.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-2xl">🔬</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
                  <p className="text-white/70 text-sm">Pushing the boundaries of data visualization and analysis.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Educational Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Learn About Exoplanet Detection</h2>
            <p className="text-white/70 max-w-3xl mx-auto">
              Discover the fascinating science behind finding planets beyond our solar system, 
              from detection methods to cutting-edge AI analysis techniques.
            </p>
          </div>
          <EducationalAccordion />
        </motion.div>

        {/* Timeline */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Exoplanet Discovery Timeline</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div 
                key={milestone.year}
                className="glass-panel rounded-xl p-6 border border-gradient-cyan-400/30"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-gradient-cyan-400 to-gradient-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">{milestone.year.slice(-2)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                    <p className="text-white/80 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Team</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.name}
                className="glass-panel rounded-2xl p-6 text-center border border-gradient-cyan-400/30"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="w-24 h-24 bg-gradient-to-r from-gradient-cyan-400 to-gradient-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-gradient-cyan-300 font-medium mb-4">{member.role}</p>
                <p className="text-white/80 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div 
          className="glass-panel rounded-2xl p-8 mb-16 border border-gradient-cyan-400/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Technology</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-cyan-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚛️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">React</h3>
              <p className="text-white/70 text-sm">Modern UI framework for interactive components</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-cyan-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Three.js</h3>
              <p className="text-white/70 text-sm">3D graphics and immersive visualization</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-cyan-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">D3.js</h3>
              <p className="text-white/70 text-sm">Advanced data visualization and analytics</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-cyan-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">WebGL</h3>
              <p className="text-white/70 text-sm">Hardware-accelerated graphics rendering</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div 
          className="grid md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <div className="glass-panel rounded-xl p-6 text-center border border-gradient-cyan-400/30">
            <div className="text-3xl font-bold text-gradient-cyan-300 mb-2 nasa-title">5,000+</div>
            <div className="text-white/80 font-space">Confirmed Exoplanets</div>
          </div>
          <div className="glass-panel rounded-xl p-6 text-center border border-gradient-cyan-400/30">
            <div className="text-3xl font-bold text-gradient-cyan-300 mb-2 nasa-title">10,000+</div>
            <div className="text-white/80 font-space">Active Users</div>
          </div>
          <div className="glass-panel rounded-xl p-6 text-center border border-gradient-cyan-400/30">
            <div className="text-3xl font-bold text-gradient-cyan-300 mb-2 nasa-title">50+</div>
            <div className="text-white/80 font-space">Scientific Publications</div>
          </div>
          <div className="glass-panel rounded-xl p-6 text-center border border-gradient-cyan-400/30">
            <div className="text-3xl font-bold text-gradient-cyan-300 mb-2 nasa-title">100+</div>
            <div className="text-white/80 font-space">Citizen Discoveries</div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6">Get Involved</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join our community of citizen scientists and help discover the next habitable world. 
            Whether you're a student, educator, or space enthusiast, there's a place for you in our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              className="px-8 py-3 bg-gradient-to-r from-gradient-cyan-400 to-gradient-blue-600 text-white font-bold rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Community
            </motion.button>
            <motion.button 
              className="px-8 py-3 border-2 border-gradient-cyan-400 text-white font-bold rounded-lg hover:bg-gradient-cyan-500/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
