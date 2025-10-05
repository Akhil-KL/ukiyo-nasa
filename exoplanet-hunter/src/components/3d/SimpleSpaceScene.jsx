import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple StarField for background
function SimpleStarField() {
  const starsRef = useRef();
  
  const starsGeometry = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 1000; i++) {
      vertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }
    return new Float32Array(vertices);
  }, []);
  
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1000}
          array={starsGeometry}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={2} color="white" />
    </points>
  );
}

// Simple Planet component
function SimplePlanet({ position, color, radius, name, onPlanetSelect, planetData }) {
  const meshRef = useRef();
  const groupRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Planet rotation
      meshRef.current.rotation.y += 0.01;
      
      // Orbital motion
      const time = state.clock.getElapsedTime();
      const orbitRadius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
      const orbitSpeed = 0.3 / orbitRadius;
      const angle = time * orbitSpeed;
      
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      groupRef.current.position.y = position[1];
    }
  });

  const handleClick = () => {
    console.log('Planet clicked:', name);
    if (onPlanetSelect) {
      onPlanetSelect({ name, ...planetData });
    }
  };

  return (
    <group ref={groupRef}>
      <mesh 
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => console.log('Hovering:', name)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Central Star
function CentralStar() {
  const starRef = useRef();
  
  useFrame(() => {
    if (starRef.current) {
      starRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <mesh ref={starRef} position={[0, 0, 0]}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFD700" 
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Simple Planets System
function SimplePlanetsSystem({ onPlanetSelect, planetsData }) {
  const defaultPlanets = [
    { name: "Vulcan-Prime", position: [15, 0, 0], color: "#B8860B", radius: 1, planetData: { discoveryYear: "Demo", hostStar: "Central Star" }},
    { name: "Inferno-Beta", position: [25, 0.5, 0], color: "#FF6B35", radius: 1.2, planetData: { discoveryYear: "Demo", hostStar: "Central Star" }},
    { name: "Terra-Nova", position: [35, 0, 0], color: "#2E8B57", radius: 1.1, planetData: { discoveryYear: "Demo", hostStar: "Central Star" }},
    { name: "Rust-Valley", position: [50, -0.5, 0], color: "#CD853F", radius: 0.9, planetData: { discoveryYear: "Demo", hostStar: "Central Star" }},
    { name: "Storm-King", position: [70, 1, 0], color: "#4682B4", radius: 2.2, planetData: { discoveryYear: "Demo", hostStar: "Central Star" }},
    { name: "Crystal-Crown", position: [90, -1, 0], color: "#DDA0DD", radius: 2.0, planetData: { discoveryYear: "Demo", hostStar: "Central Star" }}
  ];

  const planets = planetsData && planetsData.length > 0 ? planetsData.slice(0, 6) : defaultPlanets;
  
  console.log('SimplePlanetsSystem: Rendering', planets.length, 'planets');

  return (
    <>
      <CentralStar />
      {planets.map((planet, index) => (
        <SimplePlanet 
          key={index} 
          {...planet} 
          onPlanetSelect={onPlanetSelect} 
        />
      ))}
    </>
  );
}

// Main SpaceScene component
export default function SpaceScene({ 
  className = "", 
  style = {}, 
  onPlanetSelect,
  planetsData = null 
}) {
  console.log('SpaceScene: Rendering with planetsData:', planetsData?.length || 'default');
  
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
          position: [0, 30, 100],
          fov: 75
        }}
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
        onCreated={() => {
          console.log('SpaceScene Canvas created successfully');
        }}
      >
        {/* Simple lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        {/* Background stars */}
        <SimpleStarField />
        
        {/* Planets system */}
        <SimplePlanetsSystem 
          onPlanetSelect={onPlanetSelect} 
          planetsData={planetsData}
        />
      </Canvas>
      
      {/* UI overlays */}
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
    </div>
  );
}