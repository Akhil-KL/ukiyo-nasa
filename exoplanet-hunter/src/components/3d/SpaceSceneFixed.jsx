import React, { useRef, useMemo, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import StarField from './StarField';

// Optimized orbital path component with stable performance
function OrbitalPath({ radius, color = "#8B5CF6", opacity = 0.1 }) {
  const pathRef = useRef();
  
  // Memoize geometry to prevent regeneration - horizontal orbital rings
  const pathGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,           // center x, y
      radius, radius, // xRadius, yRadius  
      0, 2 * Math.PI, // start angle, end angle
      false,          // clockwise
      0               // rotation
    );
    
    const points = curve.getPoints(128); // More points for smoother circles
    // Convert 2D points to 3D and rotate to horizontal plane
    const points3D = points.map(point => new THREE.Vector3(point.x, 0, point.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points3D);
    return geometry;
  }, [radius]);
  
  // Memoize material to prevent recreation
  const pathMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity * 0.6, // More visible orbital paths
      linewidth: 1
    });
  }, [color, opacity]);
  
  useFrame((state) => {
    if (pathRef.current) {
      // Subtle orbital path animation
      const time = state.clock.getElapsedTime();
      pathRef.current.rotation.y = time * 0.0003; // Very slow rotation around Y axis
      
      // More visible breathing opacity animation
      const breathingOpacity = opacity * 0.6 + Math.sin(time * 0.4 + radius * 0.08) * 0.03;
      pathMaterial.opacity = Math.max(0.05, breathingOpacity); // Minimum visibility
    }
  });
  
  return (
    <line ref={pathRef} geometry={pathGeometry} material={pathMaterial} />
  );
}



// Enhanced planet component with optimized performance
function Planet({ position, color, radius, name, onPlanetSelect, planetData }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const ringRef = useRef();
  const cloudRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Memoize planet properties to prevent recalculation
  const planetProps = useMemo(() => {
    const isGasGiant = radius > 1.0;
    const isHabitable = name.toLowerCase().includes('terra') || name.toLowerCase().includes('earth') || color === '#2E8B57';
    const hasRings = isGasGiant && (name.toLowerCase().includes('crystal') || name.toLowerCase().includes('storm') || Math.random() > 0.6);
    
    // Stable orbital mechanics - use initial position to determine orbital radius
    const orbitRadius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
    const orbitSpeed = 0.3 / Math.sqrt(orbitRadius); // Faster, more visible orbits
    const rotationSpeed = isGasGiant ? 0.4 : 0.3; // Faster planet rotation
    const cloudSpeed = 0.15; // Faster cloud movement
    const axialTilt = (position[0] * 0.01) % 0.1; // Deterministic tilt based on position
    
    // Calculate initial orbital angle from starting position
    const initialAngle = Math.atan2(position[2], position[0]);
    
    return {
      isGasGiant,
      isHabitable,
      hasRings,
      orbitRadius,
      orbitSpeed,
      rotationSpeed,
      cloudSpeed,
      axialTilt,
      initialAngle
    };
  }, [position, radius, name, color]);
  
  const { isGasGiant, isHabitable, hasRings, orbitRadius, orbitSpeed, rotationSpeed, cloudSpeed, axialTilt, initialAngle } = planetProps;

  // Smooth animation with performance optimization
  useFrame((state, delta) => {
    // Cap delta to prevent large jumps during scroll/resize
    const smoothDelta = Math.min(delta, 0.016); // 60fps cap
    
    if (meshRef.current && groupRef.current) {
      // Smooth planet rotation with consistent timing
      meshRef.current.rotation.y += smoothDelta * rotationSpeed;
      meshRef.current.rotation.x = axialTilt;
      
      // Optimized cloud layer rotation
      if (cloudRef.current) {
        cloudRef.current.rotation.y += smoothDelta * (rotationSpeed + cloudSpeed);
        cloudRef.current.rotation.x = axialTilt;
      }
      
      // Smooth ring rotation
      if (ringRef.current) {
        ringRef.current.rotation.z += smoothDelta * rotationSpeed * 0.5;
      }
      
      // Proper orbital motion following the orbital path
      const time = state.clock.getElapsedTime();
      const currentOrbitAngle = initialAngle + (time * orbitSpeed);
      
      // Calculate position on orbital path - planets follow the orbital circles
      const x = Math.cos(currentOrbitAngle) * orbitRadius;
      const z = Math.sin(currentOrbitAngle) * orbitRadius;
      const y = position[1] + Math.sin(currentOrbitAngle * 0.3) * 0.2; // Slight vertical oscillation
      
      // Direct position setting for accurate orbital following
      groupRef.current.position.set(x, y, z);
      
      // Smooth interactive scaling
      const targetScale = hovered ? 1.4 : (clicked ? 1.2 : 1);
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        smoothDelta * 4
      );
    }
  });

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
    
    if (onPlanetSelect) {
      onPlanetSelect({ 
        name, 
        color, 
        data: {
          radius: `${radius.toFixed(1)} R⊕`,
          mass: `${(radius * 0.9 + Math.random() * 0.6).toFixed(2)} M⊕`,
          distance: `${(orbitRadius * 0.12).toFixed(2)} AU`,
          temperature: `${Math.floor(400 - orbitRadius * 6)} K`,
          type: isGasGiant ? "Gas Giant" : isHabitable ? "Habitable Planet" : "Rocky Planet",
          discoveryYear: "2009-2024",
          hostStar: "K-type Star",
          atmosphere: isGasGiant ? "Hydrogen/Helium" : isHabitable ? "Oxygen/Nitrogen" : "Thin atmosphere",
          significance: `This ${isGasGiant ? 'massive gas giant' : 'terrestrial'} exoplanet ${hasRings ? 'with ring system ' : ''}represents a fascinating example of planetary diversity.`,
          ...planetData
        }
      });
    }
  }, [name, color, radius, orbitRadius, isGasGiant, isHabitable, hasRings, onPlanetSelect, planetData]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main planet sphere with advanced materials */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhysicalMaterial 
          color={color}
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.3 : (isGasGiant ? 0.15 : 0.05)}
          roughness={isGasGiant ? 0.1 : 0.7}
          metalness={isGasGiant ? 0.05 : 0.4}
          clearcoat={isGasGiant ? 0.9 : 0.3}
          clearcoatRoughness={0.1}
          transmission={isGasGiant ? 0.2 : 0}
          thickness={1.0}
          normalScale={[0.5, 0.5]}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Cloud layer for gas giants and habitable planets */}
      {(isGasGiant || isHabitable) && (
        <mesh ref={cloudRef} scale={[1.02, 1.02, 1.02]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshPhysicalMaterial 
            color={isHabitable ? "#87CEEB" : "#F0F8FF"}
            transparent 
            opacity={hovered ? 0.4 : 0.25}
            roughness={0.8}
            transmission={0.6}
            thickness={0.3}
          />
        </mesh>
      )}
      
      {/* Ring system for gas giants */}
      {hasRings && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 2.5, 64]} />
          <meshPhysicalMaterial 
            color={color}
            transparent 
            opacity={hovered ? 0.8 : 0.6}
            roughness={0.9}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Atmospheric glow effect */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial 
          color={color}
          transparent 
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Enhanced particle effects when hovered */}
      {hovered && (
        <>
          {/* Outer glow */}
          <mesh scale={[2.2, 2.2, 2.2]}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.12}
              side={THREE.BackSide}
            />
          </mesh>
          
          {/* Dynamic lighting */}
          <pointLight 
            color={color} 
            intensity={isGasGiant ? 3 : 2} 
            distance={radius * 12} 
            decay={2}
          />
          
          {/* Magnetic field effect for gas giants */}
          {isGasGiant && (
            <mesh scale={[3, 1.5, 3]} rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[radius * 1.8, radius * 0.1, 8, 32]} />
              <meshBasicMaterial 
                color={color}
                transparent 
                opacity={0.15}
                wireframe
              />
            </mesh>
          )}
        </>
      )}
      
      {/* Enhanced planet label */}
      {hovered && (
        <Html position={[0, radius + 3.5, 0]} center>
          <div className="bg-black/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/30 shadow-2xl">
            <div className="text-white font-bold text-base mb-1">{name}</div>
            <div className="text-white/80 text-sm mb-2">
              {isGasGiant ? '🪐 Gas Giant' : isHabitable ? '🌍 Habitable' : '🪨 Rocky Planet'}
              {hasRings ? ' • Ring System' : ''}
            </div>
            <div className="text-white/60 text-xs">
              Radius: {radius.toFixed(1)}R⊕ • Distance: {(orbitRadius * 0.12).toFixed(1)}AU
            </div>
            <div className="text-cosmic-accent text-xs mt-1 font-medium">
              Click for detailed analysis →
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Optimized star component with stable performance
function CentralStar() {
  const starRef = useRef();
  const glowRef = useRef();
  
  // Memoize materials for better performance
  const starMaterial = useMemo(() => (
    new THREE.MeshPhysicalMaterial({
      color: "#FDB813",
      emissive: "#FDB813",
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0
    })
  ), []);
  
  const glowMaterial = useMemo(() => (
    new THREE.MeshBasicMaterial({
      color: "#FFD700",
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    })
  ), []);
  
  useFrame((state, delta) => {
    const smoothDelta = Math.min(delta, 0.016);
    
    if (starRef.current) {
      starRef.current.rotation.y += smoothDelta * 0.05;
      starRef.current.rotation.x += smoothDelta * 0.02;
    }
    
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      const scale = 2.2 + Math.sin(time * 0.8) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <group>
      {/* Main star - smaller for better planet visibility */}
      <mesh ref={starRef} position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1.2, 32, 32]} />
        <primitive object={starMaterial} />
      </mesh>
      
      {/* Star glow - adjusted size */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <primitive object={glowMaterial} />
      </mesh>
      
      {/* Optimized lighting - reduced intensity for better planet visibility */}
      <pointLight 
        color="#FDB813" 
        intensity={4} 
        distance={150} 
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <pointLight 
        color="#FFE55C" 
        intensity={2} 
        distance={100} 
        decay={1.5}
      />
    </group>
  );
}

// Interactive planets system with realistic exoplanet data
function InteractivePlanets({ onPlanetSelect, planetsData = null }) {
  // Default planets data - optimized spacing for visibility and responsiveness
  const defaultPlanets = [
    { 
      name: "Vulcan-Prime", 
      position: [6, 0, 0], 
      color: "#B8860B", 
      radius: 0.6,
      planetData: {
        discoveryYear: "Demo",
        hostStar: "Central Star",
        significance: "Ultra-hot rocky world with molten surface and extreme temperatures."
      }
    },
    { 
      name: "Inferno-Beta", 
      position: [9, 0.3, 0], 
      color: "#FF6B35", 
      radius: 0.8,
      planetData: {
        discoveryYear: "Demo",
        hostStar: "Central Star",
        significance: "Dense rocky planet with thick toxic atmosphere and volcanic activity."
      }
    },
    { 
      name: "Terra-Nova", 
      position: [14, 0, 0], 
      color: "#2E8B57", 
      radius: 0.8,
      planetData: {
        discoveryYear: "Demo",
        hostStar: "Central Star",
        significance: "Potentially habitable world with liquid water and stable atmosphere."
      }
    },
    { 
      name: "Rust-Valley", 
      position: [20, -0.3, 0], 
      color: "#CD853F", 
      radius: 0.7,
      planetData: {
        discoveryYear: "Demo",
        hostStar: "Central Star",
        significance: "Cold desert planet with iron oxide surface and polar ice caps."
      }
    },
    { 
      name: "Storm-King", 
      position: [30, 0.5, 0], 
      color: "#4682B4", 
      radius: 1.2,
      planetData: {
        discoveryYear: "Demo",
        hostStar: "Central Star",
        significance: "Massive gas giant with powerful storms and complex magnetic field."
      }
    },
    { 
      name: "Crystal-Crown", 
      position: [42, -0.5, 0], 
      color: "#DDA0DD", 
      radius: 1.0,
      planetData: {
        discoveryYear: "Demo",
        hostStar: "Central Star",
        significance: "Beautiful ringed gas giant with icy composition and aurora displays."
      }
    }
  ];

  // Process external data if provided, otherwise use defaults
  const planets = useMemo(() => {
    if (!planetsData || planetsData.length === 0) {
      console.log('SpaceScene: Using default planets data');
      return defaultPlanets;
    }
    
    console.log('SpaceScene: Using external planets data', planetsData);
    // Convert external data to 3D scene format
    return planetsData.slice(0, 8).map((data, index) => {
      // Extract planet properties from various possible column names
      const planetName = data.pl_name || data['Planet Name'] || data.name || `Planet-${index + 1}`;
      const radius = parseFloat(data.pl_rade || data['Planet Radius'] || data.radius || 1) || 1;
      const period = parseFloat(data.pl_orbper || data['Orbital Period'] || data.period || 100) || 100;
      const temp = parseFloat(data.pl_eqt || data['Planet Temperature'] || data.temp || 300) || 300;
      const disposition = data.pl_disc_year || data.disposition || data['Disposition'] || 'Candidate';
      
      // Calculate position based on responsive spacing that works on all screens
      const baseDistances = [6, 9, 14, 20, 30, 42, 58, 78]; // Optimized for visibility
      const distance = baseDistances[index] || (6 + index * 12); // Better progression
      const angle = index * 45 + Math.random() * 20; // More separation
      const height = (Math.random() - 0.5) * 0.8; // Reduced vertical variation
      
      // Determine color based on planet characteristics
      let color = "#8B7355"; // Default brownish
      if (radius > 2.0) {
        color = "#4682B4"; // Gas giant - blue
      } else if (temp > 1000) {
        color = "#FF4500"; // Hot planet - orange/red
      } else if (temp < 200) {
        color = "#6A5ACD"; // Cold planet - purple
      } else if (String(disposition).toLowerCase().includes('confirm')) {
        color = "#2E8B57"; // Confirmed - green
      } else if (radius < 1.5) {
        color = "#CD853F"; // Rocky world - tan
      }
      
      return {
        name: planetName,
        position: [
          distance * Math.cos(angle * Math.PI / 180),
          height,
          distance * Math.sin(angle * Math.PI / 180)
        ],
        color,
        radius: Math.min(Math.max(radius * 0.4, 0.3), 1.5), // Much smaller planets
        planetData: {
          discoveryYear: data.disc_year || data['Discovery Year'] || "Unknown",
          hostStar: data.hostname || data['Host Star'] || "Unknown Star",
          significance: `Exoplanet with ${radius.toFixed(1)} Earth radii and ${period.toFixed(1)} day orbit.`,
          temperature: `${Math.round(temp)} K`,
          orbitPeriod: `${period.toFixed(1)} days`,
          planetType: radius > 2.0 ? "Gas Giant" : radius > 1.5 ? "Super-Earth" : "Earth-like",
          ...data
        }
      };
    });
  }, [planetsData]);

  console.log('InteractivePlanets: Rendering', planets.length, 'planets');
  console.log('Planets data:', planets.map(p => ({ name: p.name, position: p.position, radius: p.radius })));

  return (
    <>
      {/* Central star system */}
      <CentralStar />

      {/* Subtle orbital paths for each planet */}
      {planets.map((planet, index) => {
        const orbitRadius = Math.sqrt(planet.position[0] ** 2 + planet.position[2] ** 2);
        return (
          <OrbitalPath 
            key={`orbit-${index}`}
            radius={orbitRadius}
            color={planet.color}
            opacity={0.04 + index * 0.005} // Much more subtle
          />
        );
      })}

      {/* Planets with enhanced features */}
      {planets.map((planet, index) => (
        <Planet 
          key={index} 
          {...planet} 
          onPlanetSelect={onPlanetSelect} 
        />
      ))}
    </>
  );
}

// Main scene content with proper lighting and controls
function SpaceSceneContent({ onPlanetSelect, planetsData }) {
  return (
    <Suspense fallback={null}>
      // Improved lighting setup for better planet visibility
      <ambientLight intensity={0.3} color="#4C1D95" />
      <directionalLight 
        position={[20, 20, 15]} 
        intensity={1.2} 
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <pointLight position={[0, 0, 0]} intensity={1.8} color="#FFD700" />
      <hemisphereLight 
        skyColor="#E2E8F0" 
        groundColor="#4C1D95" 
        intensity={0.4} 
      />
      
      {/* Background starfield */}
      <StarField 
        count={3000}
        radius={600}
        twinkleSpeed={0.4}
        rotationSpeed={0.01}
        fadeDistance={0.8}
      />
      
      {/* Interactive planets system */}
      <InteractivePlanets 
        onPlanetSelect={onPlanetSelect} 
        planetsData={planetsData}
      />
      
      {/* Camera controls - optimized for planet visibility */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.8}
        panSpeed={0.8}
        rotateSpeed={0.6}
        minDistance={8}
        maxDistance={120}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        enableDamping={true}
        dampingFactor={0.05}
        target={[0, 0, 0]}
        autoRotate={true}
        autoRotateSpeed={0.8}
      />
    </Suspense>
  );
}

// Main SpaceScene component with advanced 3D features
export default function SpaceScene({ 
  className = "", 
  style = {}, 
  onPlanetSelect,
  planetsData = null // New prop for dynamic planet data
}) {
  const canvasRef = useRef();
  
  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{
        background: 'radial-gradient(ellipse at center, #1A0B2E 0%, #030014 70%)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      <Canvas
        camera={{
          position: [0, 15, 35],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        frameloop="always"
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
        onCreated={({ gl, camera, scene, viewport }) => {
          // Enhanced renderer settings
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          
          // Add fog for depth - adjusted for closer planets
          scene.fog = new THREE.Fog('#030014', 25, 200);
          
          // Responsive camera adjustment
          const aspect = viewport.width / viewport.height;
          if (aspect < 1) {
            // Portrait mode - pull camera back more
            camera.position.set(0, 20, 50);
            camera.fov = 85;
          } else if (aspect < 1.5) {
            // Tablet/small laptop
            camera.position.set(0, 18, 40);
            camera.fov = 80;
          }
          camera.updateProjectionMatrix();
          
          console.log('SpaceScene Canvas initialized successfully - Responsive mode active');
        }}
      >
        <SpaceSceneContent 
          onPlanetSelect={onPlanetSelect} 
          planetsData={planetsData}
        />
      </Canvas>
      
      {/* Enhanced UI overlays */}
      <div className="absolute top-4 left-4 text-white/70 text-xs bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>3D Scene Active</span>
        </div>
        <div className="text-white/50">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>🌍 Click planets</div>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-white/50 text-xs bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
        <div>WebGL • {window.innerWidth}×{window.innerHeight}</div>
        <div>6 Interactive Exoplanets</div>
        <div>🌍 Optimized Orbits • 🪐 Responsive Design • ⭐ Enhanced Visuals</div>
      </div>
    </div>
  );
}