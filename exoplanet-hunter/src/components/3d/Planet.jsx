import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Planet Component
export default function Planet({
  radius = 1,
  color = '#4F46E5',
  position = [0, 0, 0],
  rotationSpeed = 0.01,
  orbitSpeed = 0.005,
  name = 'Exoplanet',
  data = {},
  showOrbit = true,
  textureUrl = null,
  atmosphereColor = null,
  onClick = null,
  ...props
}) {
  const planetRef = useRef();
  const orbitRef = useRef();
  const atmosphereRef = useRef();
  const groupRef = useRef();
  
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { camera } = useThree();

  // Create planet material with texture support
  const planetMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 30,
      transparent: false,
    });

    // Add texture if provided
    if (textureUrl) {
      const textureLoader = new THREE.TextureLoader();
      material.map = textureLoader.load(textureUrl);
    }

    return material;
  }, [color, textureUrl]);

  // Create atmosphere material if specified
  const atmosphereMaterial = useMemo(() => {
    if (!atmosphereColor) return null;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(atmosphereColor) },
        opacity: { value: 0.3 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          
          // Add some atmospheric shimmer
          float shimmer = sin(time * 2.0 + vPosition.x * 5.0) * 0.1 + 0.9;
          
          gl_FragColor = vec4(color, intensity * opacity * shimmer);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
  }, [atmosphereColor]);

  // Create orbital ring geometry
  const orbitGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,            // Center
      position[0] ? Math.abs(position[0]) : 10, // X radius
      position[2] ? Math.abs(position[2]) : 10, // Y radius
      0, 2 * Math.PI,  // Start angle, end angle
      false,           // Clockwise
      0                // Rotation
    );
    
    const points = curve.getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [position]);

  // Animation loop
  useFrame((state) => {
    if (planetRef.current) {
      // Planet rotation
      planetRef.current.rotation.y += rotationSpeed;
      
      // Atmosphere animation
      if (atmosphereRef.current && atmosphereMaterial) {
        atmosphereMaterial.uniforms.time.value = state.clock.getElapsedTime();
      }
    }

    // Orbital movement
    if (groupRef.current && orbitSpeed > 0) {
      const time = state.clock.getElapsedTime() * orbitSpeed;
      const orbitRadius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
      
      if (orbitRadius > 0) {
        groupRef.current.position.x = Math.cos(time) * orbitRadius;
        groupRef.current.position.z = Math.sin(time) * orbitRadius;
      }
    }

    // Smooth hover scaling
    if (planetRef.current) {
      const targetScale = hovered ? 1.2 : 1.0;
      planetRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // Handle planet click
  const handleClick = (event) => {
    event.stopPropagation();
    setClicked(!clicked);
    
    if (onClick) {
      onClick({
        name,
        data,
        position,
        radius,
        event
      });
    }
  };

  // Calculate distance from camera for LOD
  const distanceFromCamera = useMemo(() => {
    if (!camera) return 100;
    const planetPos = new THREE.Vector3(...position);
    return camera.position.distanceTo(planetPos);
  }, [camera, position]);

  // Adjust detail level based on distance
  const detailLevel = distanceFromCamera > 50 ? 16 : distanceFromCamera > 20 ? 32 : 64;

  return (
    <group ref={groupRef} position={orbitSpeed > 0 ? [0, position[1], 0] : position} {...props}>
      {/* Orbital Ring */}
      {showOrbit && (
        <line ref={orbitRef} geometry={orbitGeometry}>
          <lineBasicMaterial 
            color={hovered ? '#8B5CF6' : '#4B5563'} 
            transparent={true}
            opacity={hovered ? 0.8 : 0.3}
            linewidth={2}
          />
        </line>
      )}

      {/* Planet Sphere */}
      <mesh
        ref={planetRef}
        position={orbitSpeed > 0 ? [0, 0, 0] : [0, 0, 0]}
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
        <sphereGeometry args={[radius, detailLevel, detailLevel]} />
        <primitive object={planetMaterial} />
        
        {/* Glow effect when hovered */}
        {hovered && (
          <pointLight
            intensity={0.5}
            color={color}
            distance={radius * 4}
            decay={2}
          />
        )}
      </mesh>

      {/* Atmosphere Layer */}
      {atmosphereColor && atmosphereMaterial && (
        <mesh ref={atmosphereRef} scale={1.05}>
          <sphereGeometry args={[radius, 32, 32]} />
          <primitive object={atmosphereMaterial} />
        </mesh>
      )}

      {/* Planet Label */}
      {(hovered || clicked) && (
        <Html
          position={[0, radius + 1, 0]}
          center
          distanceFactor={10}
          occlude={false}
        >
          <div className="planet-label glass-effect rounded-lg px-3 py-2 pointer-events-none">
            <div className="text-cosmic-star font-semibold text-sm mb-1">
              {name}
            </div>
            {data.radius && (
              <div className="text-space-300 text-xs">
                Radius: {data.radius}
              </div>
            )}
            {data.distance && (
              <div className="text-space-300 text-xs">
                Distance: {data.distance}
              </div>
            )}
            {data.temperature && (
              <div className="text-space-300 text-xs">
                Temp: {data.temperature}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Detailed Info Panel */}
      {clicked && (
        <Html
          position={[radius + 2, 0, 0]}
          center
          distanceFactor={8}
          occlude={false}
        >
          <div className="planet-details glass-effect rounded-xl p-4 w-64 pointer-events-auto">
            <h3 className="text-cosmic-star font-bold text-lg mb-3">{name}</h3>
            
            <div className="space-y-2">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-space-400 capitalize text-sm">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-space-200 text-sm font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setClicked(false);
              }}
              className="mt-4 w-full px-3 py-2 bg-cosmic-accent hover:bg-cosmic-purple text-cosmic-star rounded-lg text-sm transition-colors duration-200"
            >
              Close Details
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

// Specialized planet variants for common exoplanet types
export function RockyPlanet(props) {
  return (
    <Planet
      color="#8B4513"
      atmosphereColor={null}
      {...props}
    />
  );
}

export function GasGiant(props) {
  return (
    <Planet
      color="#4169E1"
      atmosphereColor="#87CEEB"
      radius={2}
      {...props}
    />
  );
}

export function IceGiant(props) {
  return (
    <Planet
      color="#40E0D0"
      atmosphereColor="#B0E0E6"
      radius={1.8}
      {...props}
    />
  );
}

export function SuperEarth(props) {
  return (
    <Planet
      color="#228B22"
      atmosphereColor="#87CEEB"
      radius={1.5}
      {...props}
    />
  );
}

export function HotJupiter(props) {
  return (
    <Planet
      color="#FF6347"
      atmosphereColor="#FF4500"
      radius={2.2}
      rotationSpeed={0.02}
      {...props}
    />
  );
}