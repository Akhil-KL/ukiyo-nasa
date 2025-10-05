import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function TestPlanet({ position, color }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      // Simple orbital motion
      const time = state.clock.getElapsedTime();
      meshRef.current.position.x = Math.cos(time * 0.5) * position[0];
      meshRef.current.position.z = Math.sin(time * 0.5) * position[0];
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function TestScene() {
  console.log('TestScene: Rendering simple test scene');
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
        onCreated={() => console.log('TestScene: Canvas created successfully')}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Central star */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Test planets */}
        <TestPlanet position={[8, 0, 0]} color="#FF6B35" />
        <TestPlanet position={[15, 0, 0]} color="#2E8B57" />
        <TestPlanet position={[22, 0, 0]} color="#4682B4" />
      </Canvas>
    </div>
  );
}