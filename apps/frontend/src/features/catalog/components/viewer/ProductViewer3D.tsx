'use client';

import { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const gltf = useLoader(GLTFLoader, url);

  // Center and scale the model
  useEffect(() => {
    if (gltf.scene) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;

      gltf.scene.scale.setScalar(scale);
      gltf.scene.position.sub(center.multiplyScalar(scale));
    }
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

interface ProductViewer3DProps {
  modelUrl: string;
}

export default function ProductViewer3D({ modelUrl }: ProductViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch support + small screen for "mobile" classification
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    setIsTouch(hasTouch && isSmallScreen);
  }, []);

  // Check if URL is a valid 3D model format (strip query params for signed URLs)
  const getPathFromUrl = (url: string) => {
    try { return new URL(url).pathname; } catch { return url; }
  };
  const is3DModel = modelUrl && /\.(glb|gltf)/i.test(getPathFromUrl(modelUrl));

  if (!is3DModel) {
    // Fallback to image if not a 3D model
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <img
          src={modelUrl}
          alt="Product preview"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-gray-900 to-black">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Environment for reflections */}
        <Environment preset="studio" />

        {/* 3D Model */}
        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Controls Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-[10px] text-gray-300 space-y-1 shadow-2xl transition-all duration-500">
        {isTouch ? (
          <div className="flex flex-col gap-1.5 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-lg text-xs">👆</span>
              <span>Drag to Rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-lg text-xs">✌️</span>
              <span>Pinch to Zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-lg text-xs">✋</span>
              <span>Two-finger Pan</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-lg text-xs">🖱️</span>
              <span>Left Click: Rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-lg text-xs">🖱️</span>
              <span>Right Click: Pan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-lg text-xs">⚙️</span>
              <span>Scroll: Zoom</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}