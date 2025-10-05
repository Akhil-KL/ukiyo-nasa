import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Simple interactive planet component
function SimplePlanet({ 
  position = [0, 0, 0], 
  radius = 1, 
  color = "#8B5CF6", 
  name = "Planet",
  data = {},
  onPlanetSelect,
  rotationSpeed = 0.01 
}) {
  const planetRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
  });

  const handleClick = () => {
    if (onPlanetSelect) {
      onPlanetSelect({ name, data, color });
    }
  };

  return (
    <group position={position}>
      {/* Planet sphere */}
      <mesh 
        ref={planetRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.2 : 0}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Planet label */}
      {hovered && (
        <Text
          position={[0, radius + 1, 0]}
          fontSize={0.8}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
        >
          {name}
        </Text>
      )}
      
      {/* Simple orbital ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[Math.sqrt(position[0] ** 2 + position[2] ** 2), 0.05, 8, 32]} />
        <meshBasicMaterial 
          color="#444444" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
    </group>
  );
}

// Main exoplanet system
export default function ExoplanetSystem({ onPlanetSelect }) {
  // Sample planets with real data
  const planets = [
    {
      name: "Kepler-452b",
      position: [8, 0, 0],
      radius: 1.2,
      color: "#8B7355",
      rotationSpeed: 0.008,
      data: {
        radius: "1.6 R⊕",
        mass: "5.0 M⊕",
        distance: "1,402 ly",
        temperature: "265 K",
        type: "Super-Earth",
        discoveryYear: "2015",
        hostStar: "Kepler-452"
      }
    },
    {
      name: "HD 209458 b",
      position: [12, 1, 0],
      radius: 1.5,
      color: "#FF4500",
      rotationSpeed: 0.015,
      data: {
        radius: "1.8 R♃",
        mass: "0.7 M♃",
        distance: "159 ly",
        temperature: "1,130 K",
        type: "Hot Jupiter",
        discoveryYear: "1999",
        hostStar: "HD 209458"
      }
    },
    {
      name: "WASP-96b",
      position: [16, -1, 0],
      radius: 1.8,
      color: "#4682B4",
      rotationSpeed: 0.006,
      data: {
        radius: "2.1 R♃",
        mass: "0.48 M♃",
        distance: "1,150 ly",
        temperature: "1,300 K",
        type: "Hot Neptune",
        discoveryYear: "2013",
        hostStar: "WASP-96"
      }
    },
    {
      name: "K2-18b",
      position: [6, 0.5, 0],
      radius: 1.3,
      color: "#2E8B57",
      rotationSpeed: 0.005,
      data: {
        radius: "2.3 R⊕",
        mass: "8.6 M⊕",
        distance: "124 ly",
        temperature: "250 K",
        type: "Super-Earth",
        discoveryYear: "2015",
        hostStar: "K2-18",
        atmosphere: "H₂O detected"
      }
    },
    {
      name: "51 Pegasi b",
      position: [4, -0.5, 0],
      radius: 1.6,
      color: "#6A5ACD",
      rotationSpeed: 0.012,
      data: {
        radius: "1.9 R♃",
        mass: "0.47 M♃",
        distance: "50.45 ly",
        temperature: "1,200 K",
        type: "Hot Jupiter",
        discoveryYear: "1995",
        hostStar: "51 Pegasi",
        significance: "First exoplanet around main-sequence star"
      }
    }
  ];

  return (
    <>
      {/* Central star */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color="#FDB813" 
          emissive="#FDB813"
          emissiveIntensity={0.5}
        />
        {/* Star glow */}
        <pointLight
          color="#FDB813"
          intensity={3}
          distance={100}
          decay={2}
        />
      </mesh>

      {/* Star label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.6}
        color="#FDB813"
        anchorX="center"
        anchorY="bottom"
      >
        Host Star
      </Text>

      {/* Render planets */}
      {planets.map((planet, index) => (
        <SimplePlanet
          key={index}
          name={planet.name}
          position={planet.position}
          radius={planet.radius}
          color={planet.color}
          rotationSpeed={planet.rotationSpeed}
          data={planet.data}
          onPlanetSelect={onPlanetSelect}
        />
      ))}

      {/* Simple asteroid belt */}
      <AsteroidBelt />
    </>
  );
}

// Simple asteroid belt
function AsteroidBelt() {
  const asteroids = [];
  const asteroidCount = 50;

  for (let i = 0; i < asteroidCount; i++) {
    const angle = (i / asteroidCount) * Math.PI * 2;
    const radius = 22 + Math.random() * 3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 1;

    asteroids.push(
      <mesh
        key={i}
        position={[x, y, z]}
        rotation={[
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ]}
        scale={Math.random() * 0.1 + 0.03}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
    );
  }

  return <>{asteroids}</>;
}