'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Grid, Sky, PerspectiveCamera, AccumulativeShadows, RandomizedLight, SoftShadows } from '@react-three/drei';
import { Physics, Debug } from '@react-three/cannon';
import { ReactNode, Suspense } from 'react';
import { Vector3, Color } from 'three';

// 로딩 표시기 컴포넌트
const Loader = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="hotpink" wireframe />
    </mesh>
  );
};

interface XRCanvasProps {
  children: ReactNode;
  cameraPosition?: Vector3 | [number, number, number];
  environmentPreset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';
  showGrid?: boolean;
  showSky?: boolean;
  enablePhysics?: boolean;
}

export default function XRCanvas({
  children,
  cameraPosition = [5, 5, 5],
  environmentPreset = 'night',
  showGrid = true,
  showSky = true,
  enablePhysics = true,
}: XRCanvasProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl, scene }) => {
          scene.background = new Color('#ffffff');
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={60}
          near={0.1}
          far={1000}
        />
        
        <SoftShadows size={25} samples={16} focus={0.5} />
        
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <directionalLight 
            position={[-5, 5, -5]} 
            intensity={0.4} 
            castShadow={false}
          />
          <directionalLight 
            position={[0, 10, 0]} 
            intensity={0.6} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          
          {showSky && <Sky sunPosition={[10, 10, 5]} turbidity={10} rayleigh={3} />}
          
          {showGrid && (
            <Grid
              infiniteGrid
              cellSize={1}
              cellThickness={0.5}
              sectionSize={3}
              sectionThickness={1}
              fadeStrength={1.5}
              fadeDistance={30}
              cellColor="#444444"
              sectionColor="#666666"
            />
          )}
          
          {enablePhysics ? (
            <Physics gravity={[0, -9.8, 0]}>
              {children}
            </Physics>
          ) : (
            children
          )}
          
          <Environment preset={environmentPreset} background={false} />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={30}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 