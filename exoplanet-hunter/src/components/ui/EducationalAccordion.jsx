import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EducationalAccordion = () => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (index) => {
    setActiveSection(activeSection === index ? null : index);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSection(index);
    }
  };

  const sections = [
    {
      id: 'what-are-exoplanets',
      title: 'What are Exoplanets?',
      icon: '🪐',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-white/90 leading-relaxed">
                Exoplanets, or extrasolar planets, are planets that orbit stars outside our Solar System. 
                These distant worlds come in a fascinating variety of sizes, compositions, and orbital configurations 
                that challenge our understanding of planetary formation.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-red-400 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <h4 className="text-gradient-red-300 font-semibold mb-1">Hot Jupiters</h4>
                    <p className="text-white/80 text-sm">Gas giants orbiting extremely close to their stars</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-red-400 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <h4 className="text-gradient-red-300 font-semibold mb-1">Super-Earths</h4>
                    <p className="text-white/80 text-sm">Rocky planets larger than Earth but smaller than Neptune</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-red-400 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <h4 className="text-gradient-red-300 font-semibold mb-1">Habitable Zone Planets</h4>
                    <p className="text-white/80 text-sm">Planets where liquid water could potentially exist</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  {/* Animated Solar System SVG */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Star */}
                    <circle
                      cx="100"
                      cy="100"
                      r="12"
                      fill="url(#starGradient)"
                      className="drop-shadow-lg"
                    >
                      <animate
                        attributeName="r"
                        values="12;14;12"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    
                    {/* Orbital paths */}
                    <circle
                      cx="100"
                      cy="100"
                      r="30"
                      fill="none"
                      stroke="rgba(239, 68, 68, 0.3)"
                      strokeWidth="1"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="50"
                      fill="none"
                      stroke="rgba(239, 68, 68, 0.3)"
                      strokeWidth="1"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="rgba(239, 68, 68, 0.3)"
                      strokeWidth="1"
                    />

                    {/* Planets */}
                    <circle cx="130" cy="100" r="4" fill="#ef4444">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 100 100;360 100 100"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="150" cy="100" r="6" fill="#3b82f6">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 100 100;360 100 100"
                        dur="8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="170" cy="100" r="3" fill="#10b981">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 100 100;360 100 100"
                        dur="12s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Gradients */}
                    <defs>
                      <radialGradient id="starGradient">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                <p className="text-sm text-white/70">Exoplanetary System Model</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
            <h4 className="text-gradient-red-300 font-semibold mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Did You Know?
            </h4>
            <p className="text-white/80 text-sm">
              The first exoplanet around a main-sequence star was discovered in 1995. Since then, we've confirmed 
              over 5,000 exoplanets, with thousands more candidates awaiting confirmation!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'transit-method',
      title: 'Transit Method Explained',
      icon: '🌗',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <p className="text-white/90 leading-relaxed">
                The transit method detects exoplanets by measuring the tiny decrease in starlight 
                when a planet passes in front of its host star from our perspective. This creates 
                a characteristic dip in the star's brightness curve.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
                  <h4 className="text-gradient-red-300 font-semibold mb-2">Key Requirements:</h4>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-start space-x-2">
                      <span className="text-gradient-red-400 mt-1">•</span>
                      <span>Planet's orbit must align with Earth's line of sight</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-gradient-red-400 mt-1">•</span>
                      <span>Regular, periodic dimming pattern</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-gradient-red-400 mt-1">•</span>
                      <span>Precise photometry to detect small changes</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
                  <h4 className="text-gradient-red-300 font-semibold mb-2">What We Can Learn:</h4>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-start space-x-2">
                      <span className="text-gradient-red-400 mt-1">•</span>
                      <span>Planet size (from transit depth)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-gradient-red-400 mt-1">•</span>
                      <span>Orbital period (from transit frequency)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-gradient-red-400 mt-1">•</span>
                      <span>Atmospheric composition (with spectroscopy)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Interactive Transit Diagram */}
              <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
                <h4 className="text-white font-semibold mb-4 text-center">Transit Animation</h4>
                <div className="relative">
                  <svg viewBox="0 0 300 150" className="w-full h-24">
                    {/* Star */}
                    <circle cx="150" cy="75" r="25" fill="url(#starGradient2)">
                      <animate
                        attributeName="opacity"
                        values="1;0.8;1"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    
                    {/* Planet */}
                    <circle cx="50" cy="75" r="8" fill="#3b82f6">
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0;200,0;0,0"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    
                    {/* Orbital path */}
                    <line x1="30" y1="75" x2="270" y2="75" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" strokeDasharray="5,5"/>
                    
                    <defs>
                      <radialGradient id="starGradient2">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                <p className="text-sm text-white/70 text-center mt-2">Planet transiting in front of star</p>
              </div>
              
              {/* Light Curve */}
              <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
                <h4 className="text-white font-semibold mb-4 text-center">Brightness Light Curve</h4>
                <div className="relative">
                  <svg viewBox="0 0 300 100" className="w-full h-20">
                    {/* Grid lines */}
                    <g stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                      <line x1="50" y1="20" x2="250" y2="20" />
                      <line x1="50" y1="40" x2="250" y2="40" />
                      <line x1="50" y1="60" x2="250" y2="60" />
                      <line x1="50" y1="80" x2="250" y2="80" />
                    </g>
                    
                    {/* Light curve path */}
                    <path
                      d="M50,40 L120,40 L130,60 L170,60 L180,40 L250,40"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        values="0,200;200,0"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </path>
                    
                    {/* Labels */}
                    <text x="60" y="35" fill="white" fontSize="8">Normal</text>
                    <text x="140" y="75" fill="white" fontSize="8">Transit</text>
                    <text x="200" y="35" fill="white" fontSize="8">Normal</text>
                  </svg>
                </div>
                <p className="text-sm text-white/70 text-center mt-2">Characteristic transit light curve</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-detection',
      title: 'How AI Helps Detection',
      icon: '🤖',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <p className="text-white/90 leading-relaxed">
                Artificial Intelligence revolutionizes exoplanet detection by automatically analyzing 
                vast amounts of telescope data, identifying subtle patterns that might be missed by 
                traditional methods, and dramatically accelerating the discovery process.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
                  <h4 className="text-gradient-red-300 font-semibold mb-3">Machine Learning Pipeline:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gradient-red-300">1</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium text-sm">Data Preprocessing</h5>
                        <p className="text-white/70 text-xs">Clean and normalize light curves</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gradient-red-300">2</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium text-sm">Feature Extraction</h5>
                        <p className="text-white/70 text-xs">Identify transit-like patterns</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gradient-red-300">3</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium text-sm">Classification</h5>
                        <p className="text-white/70 text-xs">Neural networks classify signals</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gradient-red-300">4</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium text-sm">Validation</h5>
                        <p className="text-white/70 text-xs">Confirm planet candidates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* AI Performance Metrics */}
              <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
                <h4 className="text-white font-semibold mb-4 text-center">AI Detection Performance</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Accuracy</span>
                      <span className="text-gradient-red-300 font-bold">96.7%</span>
                    </div>
                    <div className="w-full bg-gradient-red-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gradient-red-400 to-gradient-red-600 h-2 rounded-full" style={{width: '96.7%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">False Positive Rate</span>
                      <span className="text-gradient-red-300 font-bold">2.1%</span>
                    </div>
                    <div className="w-full bg-gradient-red-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gradient-red-400 to-gradient-red-600 h-2 rounded-full" style={{width: '2.1%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Processing Speed</span>
                      <span className="text-gradient-red-300 font-bold">1000x</span>
                    </div>
                    <div className="w-full bg-gradient-red-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gradient-red-400 to-gradient-red-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Interactive Example */}
              <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
                <h4 className="text-white font-semibold mb-4 text-center">Neural Network Visualization</h4>
                <div className="relative">
                  <svg viewBox="0 0 280 120" className="w-full h-24">
                    {/* Input layer */}
                    <g>
                      <circle cx="30" cy="30" r="8" fill="#3b82f6" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="30" cy="60" r="8" fill="#3b82f6" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.3s" />
                      </circle>
                      <circle cx="30" cy="90" r="8" fill="#3b82f6" opacity="0.7">
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" begin="0.6s" />
                      </circle>
                    </g>
                    
                    {/* Hidden layer */}
                    <g>
                      <circle cx="120" cy="20" r="6" fill="#10b981" opacity="0.5">
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.5s" />
                      </circle>
                      <circle cx="120" cy="45" r="6" fill="#10b981" opacity="0.7">
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" begin="0.8s" />
                      </circle>
                      <circle cx="120" cy="70" r="6" fill="#10b981" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1.1s" />
                      </circle>
                      <circle cx="120" cy="95" r="6" fill="#10b981" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" begin="1.4s" />
                      </circle>
                    </g>
                    
                    {/* Output layer */}
                    <g>
                      <circle cx="210" cy="45" r="8" fill="#ef4444" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1.5s" />
                      </circle>
                      <circle cx="210" cy="75" r="8" fill="#ef4444" opacity="0.3">
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="1.5s" />
                      </circle>
                    </g>
                    
                    {/* Connections */}
                    <g stroke="rgba(255,255,255,0.2)" strokeWidth="1">
                      <line x1="38" y1="30" x2="112" y2="20" />
                      <line x1="38" y1="60" x2="112" y2="45" />
                      <line x1="38" y1="90" x2="112" y2="70" />
                      <line x1="128" y1="45" x2="202" y2="45" />
                      <line x1="128" y1="70" x2="202" y2="75" />
                    </g>
                    
                    {/* Labels */}
                    <text x="15" y="110" fill="white" fontSize="10" textAnchor="middle">Input</text>
                    <text x="120" y="110" fill="white" fontSize="10" textAnchor="middle">Hidden</text>
                    <text x="210" y="110" fill="white" fontSize="10" textAnchor="middle">Output</text>
                    <text x="240" y="50" fill="#ef4444" fontSize="8">Planet!</text>
                    <text x="240" y="80" fill="white" fontSize="8" opacity="0.5">No Planet</text>
                  </svg>
                </div>
                <p className="text-sm text-white/70 text-center mt-2">AI classifying transit signals</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
            <h4 className="text-gradient-red-300 font-semibold mb-2 flex items-center">
              <span className="mr-2">⚡</span>
              AI Advantages
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-white/80">
              <div>
                <strong className="text-white">Speed:</strong> Process thousands of light curves in minutes
              </div>
              <div>
                <strong className="text-white">Consistency:</strong> No human fatigue or bias
              </div>
              <div>
                <strong className="text-white">Pattern Recognition:</strong> Detect subtle, complex signals
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dataset-info',
      title: 'Dataset Information',
      icon: '📊',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <p className="text-white/90 leading-relaxed">
                Our platform utilizes comprehensive datasets from NASA's Exoplanet Archive, 
                combining observations from multiple space missions and ground-based telescopes 
                to provide the most complete picture of confirmed exoplanets.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
                  <h4 className="text-gradient-red-300 font-semibold mb-3">Primary Data Sources:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gradient-red-300">K</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium text-sm">Kepler Space Telescope</h5>
                        <p className="text-white/70 text-xs">4,000+ confirmed planets from transit photometry</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gradient-red-300">T</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium text-sm">TESS Mission</h5>
                        <p className="text-white/70 text-xs">All-sky survey with 1,000+ discoveries</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gradient-red-300">G</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium text-sm">Ground-based Observatories</h5>
                        <p className="text-white/70 text-xs">Radial velocity and direct imaging confirmations</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
                  <h4 className="text-gradient-red-300 font-semibold mb-3">Data Parameters:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
                    <div>
                      <span className="text-gradient-red-300">•</span> Planetary radius
                    </div>
                    <div>
                      <span className="text-gradient-red-300">•</span> Orbital period
                    </div>
                    <div>
                      <span className="text-gradient-red-300">•</span> Host star properties
                    </div>
                    <div>
                      <span className="text-gradient-red-300">•</span> Equilibrium temperature
                    </div>
                    <div>
                      <span className="text-gradient-red-300">•</span> Discovery method
                    </div>
                    <div>
                      <span className="text-gradient-red-300">•</span> Habitability metrics
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Dataset Statistics */}
              <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
                <h4 className="text-white font-semibold mb-4 text-center">Current Dataset Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-red-300 mb-1">5,005</div>
                    <div className="text-xs text-white/70">Confirmed Planets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-red-300 mb-1">3,814</div>
                    <div className="text-xs text-white/70">Planetary Systems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-red-300 mb-1">847</div>
                    <div className="text-xs text-white/70">Multi-planet Systems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-red-300 mb-1">163</div>
                    <div className="text-xs text-white/70">Potentially Habitable</div>
                  </div>
                </div>
              </div>
              
              {/* Data Quality Indicators */}
              <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
                <h4 className="text-white font-semibold mb-4 text-center">Data Quality Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Measurement Precision</span>
                      <span className="text-gradient-red-300 font-bold">99.2%</span>
                    </div>
                    <div className="w-full bg-gradient-red-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gradient-red-400 to-gradient-red-600 h-2 rounded-full" style={{width: '99.2%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Completeness</span>
                      <span className="text-gradient-red-300 font-bold">87.5%</span>
                    </div>
                    <div className="w-full bg-gradient-red-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gradient-red-400 to-gradient-red-600 h-2 rounded-full" style={{width: '87.5%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Validation Rate</span>
                      <span className="text-gradient-red-300 font-bold">94.8%</span>
                    </div>
                    <div className="w-full bg-gradient-red-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-gradient-red-400 to-gradient-red-600 h-2 rounded-full" style={{width: '94.8%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Interactive Data Explorer */}
              <div className="bg-gradient-to-br from-gradient-red-600/20 to-gradient-red-800/20 rounded-xl p-6 border border-gradient-red-400/30">
                <h4 className="text-white font-semibold mb-4 text-center">Discovery Timeline</h4>
                <div className="relative">
                  <svg viewBox="0 0 280 80" className="w-full h-16">
                    {/* Timeline axis */}
                    <line x1="20" y1="60" x2="260" y2="60" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="2"/>
                    
                    {/* Data points */}
                    <circle cx="40" cy="60" r="4" fill="#3b82f6">
                      <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="80" cy="60" r="3" fill="#10b981">
                      <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" begin="0.5s" />
                    </circle>
                    <circle cx="120" cy="60" r="5" fill="#f59e0b">
                      <animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite" begin="1s" />
                    </circle>
                    <circle cx="160" cy="60" r="6" fill="#ef4444">
                      <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite" begin="1.5s" />
                    </circle>
                    <circle cx="200" cy="60" r="7" fill="#8b5cf6">
                      <animate attributeName="r" values="7;9;7" dur="3s" repeatCount="indefinite" begin="2s" />
                    </circle>
                    <circle cx="240" cy="60" r="8" fill="#ec4899">
                      <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" begin="2.5s" />
                    </circle>
                    
                    {/* Year labels */}
                    <text x="40" y="45" fill="white" fontSize="8" textAnchor="middle">1995</text>
                    <text x="80" y="45" fill="white" fontSize="8" textAnchor="middle">2000</text>
                    <text x="120" y="45" fill="white" fontSize="8" textAnchor="middle">2005</text>
                    <text x="160" y="45" fill="white" fontSize="8" textAnchor="middle">2010</text>
                    <text x="200" y="45" fill="white" fontSize="8" textAnchor="middle">2015</text>
                    <text x="240" y="45" fill="white" fontSize="8" textAnchor="middle">2020</text>
                  </svg>
                </div>
                <p className="text-sm text-white/70 text-center mt-2">Exoplanet discovery growth over time</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gradient-red-600/10 to-gradient-red-800/10 rounded-lg p-4 border border-gradient-red-400/20">
            <h4 className="text-gradient-red-300 font-semibold mb-2 flex items-center">
              <span className="mr-2">🔄</span>
              Real-time Updates
            </h4>
            <p className="text-white/80 text-sm">
              Our dataset is continuously updated with new discoveries from ongoing missions. 
              New planets are typically added within 24-48 hours of official confirmation by the astronomical community.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className="border border-gradient-red-400/30 rounded-xl overflow-hidden glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Accordion Header */}
            <button
              className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-gradient-red-400/50 transition-all duration-200 hover:bg-gradient-red-500/10"
              onClick={() => toggleSection(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-expanded={activeSection === index}
              aria-controls={`section-${section.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {section.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    {section.title}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: activeSection === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gradient-red-400"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </motion.div>
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {activeSection === index && (
                <motion.div
                  id={`section-${section.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-gradient-red-400/20 pt-6">
                      {section.content}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EducationalAccordion;