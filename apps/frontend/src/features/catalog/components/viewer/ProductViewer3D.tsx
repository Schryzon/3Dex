'use client';

import { useRef, useEffect, Suspense } from 'react';
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
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-gray-300 space-y-1">
        <p>🖱️ Left click + drag: Rotate</p>
        <p>🖱️ Right click + drag: Pan</p>
        <p>🖱️ Scroll: Zoom</p>
      </div>
    </div>
  );
}