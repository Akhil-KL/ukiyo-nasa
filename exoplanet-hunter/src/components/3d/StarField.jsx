import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Advanced StarField Component with optimized performance
export default function StarField({ 
  count = 5000,
  radius = 1000,
  twinkleSpeed = 0.5,
  rotationSpeed = 0.02,
  fadeDistance = 0.8
}) {
  const starsRef = useRef();
  const materialRef = useRef();

  // Generate star data with improved distribution and properties
  const starData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const twinkleOffsets = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Improved spherical distribution with galaxy-like clustering
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      
      // Create more realistic distribution - denser toward galactic plane
      const galaxyFactor = Math.abs(Math.cos(phi)) * 0.3 + 0.7;
      const r = radius * galaxyFactor * (0.4 + Math.random() * 0.6);
      
      // Convert to cartesian coordinates
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Realistic star properties
      const starType = Math.random();
      let starColor, starSize;
      
      if (starType < 0.1) {
        // Blue giants (rare, large, bright)
        starColor = [0.6, 0.8, 1.0];
        starSize = 3 + Math.random() * 2;
      } else if (starType < 0.3) {
        // White stars (uncommon, medium)
        starColor = [1.0, 1.0, 0.9];
        starSize = 2 + Math.random() * 1.5;
      } else if (starType < 0.8) {
        // Yellow stars like our Sun (common, medium)
        starColor = [1.0, 0.9, 0.7];
        starSize = 1.5 + Math.random() * 1;
      } else {
        // Red dwarfs (very common, small, dim)
        starColor = [1.0, 0.6, 0.4];
        starSize = 0.8 + Math.random() * 0.7;
      }
      
      sizes[i] = starSize;
      colors[i * 3] = starColor[0];
      colors[i * 3 + 1] = starColor[1];
      colors[i * 3 + 2] = starColor[2];
      
      // Random twinkle timing offset
      twinkleOffsets[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, sizes, colors, twinkleOffsets };
  }, [count, radius]);

  // Advanced animation with realistic twinkling
  useFrame((state, delta) => {
    if (starsRef.current && materialRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Gentle galaxy rotation
      starsRef.current.rotation.x += delta * rotationSpeed * 0.1;
      starsRef.current.rotation.y += delta * rotationSpeed * 0.3;
      starsRef.current.rotation.z += delta * rotationSpeed * 0.05;
      
      // Dynamic size variation for twinkling effect
      const sizeAttribute = starsRef.current.geometry.attributes.size;
      if (sizeAttribute) {
        for (let i = 0; i < count; i++) {
          const baseSize = starData.sizes[i];
          const twinkleOffset = starData.twinkleOffsets[i];
          const twinkle = Math.sin(time * twinkleSpeed + twinkleOffset) * 0.3 + 1;
          sizeAttribute.array[i] = baseSize * twinkle;
        }
        sizeAttribute.needsUpdate = true;
      }
      
      // Subtle opacity breathing effect
      materialRef.current.opacity = 0.7 + Math.sin(time * 0.5) * 0.15;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={starData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={starData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={starData.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={2}
        transparent
        opacity={0.85}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
        alphaTest={0.001}
      />
    </points>
  );
}

// Performance-optimized variant with instancing for even more stars
export function StarFieldInstanced({ 
  count = 10000,
  radius = 1200,
  clusters = 5 
}) {
  const instancedMeshRef = useRef();
  
  // Generate clustered star positions for more realistic galaxy-like appearance
  const instanceMatrix = useMemo(() => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const scale = new THREE.Vector3();
    
    const positions = [];
    
    for (let i = 0; i < count; i++) {
      // Create star clusters for more realistic distribution
      const clusterIndex = Math.floor(Math.random() * clusters);
      const clusterOffset = new THREE.Vector3(
        (Math.random() - 0.5) * radius * 0.3,
        (Math.random() - 0.5) * radius * 0.3,
        (Math.random() - 0.5) * radius * 0.3
      );
      
      // Random position within cluster
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const r = radius * (0.5 + Math.random() * 0.5);
      
      position.set(
        r * Math.sin(phi) * Math.cos(theta) + clusterOffset.x,
        r * Math.sin(phi) * Math.sin(theta) + clusterOffset.y,
        r * Math.cos(phi) + clusterOffset.z
      );
      
      rotation.set(0, 0, 0);
      scale.setScalar(Math.random() * 2 + 0.5);
      
      matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
      positions.push(matrix.clone());
    }
    
    return positions;
  }, [count, radius, clusters]);
  
  useFrame((state, delta) => {
    if (instancedMeshRef.current) {
      instancedMeshRef.current.rotation.x += delta * 0.01;
      instancedMeshRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <instancedMesh 
      ref={instancedMeshRef} 
      args={[null, null, count]}
    >
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial 
        color="#FFFFFF" 
        transparent 
        opacity={0.8}
      />
      {instanceMatrix.map((matrix, index) => (
        <primitive key={index} object={matrix} attach={`instanceMatrix-${index}`} />
      ))}
    </instancedMesh>
  );
}