'use client';

import { useRef, useEffect, Suspense, useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Settings, Sun, RotateCw } from 'lucide-react';
import { KTX2Loader } from 'three-stdlib';
import { MeshoptDecoder } from 'meshoptimizer';

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const gl = useThree((state) => state.gl);

  const { scene } = useGLTF(url, true, true, (loader) => {
    // 1. DRACO
    const dracoLoader = require('three-stdlib').DRACOLoader;
    const draco = new dracoLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(draco);

    // 2. KTX2
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/basis/');
    ktx2Loader.detectSupport(gl);
    loader.setKTX2Loader(ktx2Loader);

    // 3. Meshopt
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  // Center and scale the model + scene optimizations
  useMemo(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;

      scene.scale.setScalar(scale);
      scene.position.sub(center.multiplyScalar(scale));

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m) {
            m.side = THREE.DoubleSide;

            // Fix for improperly exported GLTF models (common in game rips)
            // where base color is #000000, causing textures to multiply to pitch black.
            if (m.map && m.color.r === 0 && m.color.g === 0 && m.color.b === 0) {
              m.color.setHex(0xffffff);
            }

            if (!m.map && m.color.r > 0.9 && m.color.g > 0.9 && m.color.b > 0.9) {
              m.color.setHex(0xcccccc);
            }
          }
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} />;
}

interface ProductViewer3DProps {
  modelUrl: string;
}

export default function ProductViewer3D({ modelUrl }: ProductViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [environment, setEnvironment] = useState<any>('studio');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const environments = [
    { id: 'studio', label: 'Studio' },
    { id: 'city', label: 'City' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'forest', label: 'Forest' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'dawn', label: 'Dawn' },
    { id: 'park', label: 'Park' },
  ];

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
          powerPreference: 'high-performance',
          toneMapping: 7, // NeutralToneMapping (prevents blowout/overexposure on PBR models)
          toneMappingExposure: 1.0,
          outputColorSpace: 'srgb',
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />

        {/* Lighting */}
        <ambientLight intensity={1.2} />
        <hemisphereLight intensity={0.5} position={[0, 10, 0]} color="#ffffff" groundColor="#444444" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={2.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Environment for reflections */}
        <Environment preset={environment} />

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
          autoRotate={autoRotate}
          autoRotateSpeed={1.0}
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

      {/* Lighting & Rotation Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl backdrop-blur-md border transition-all duration-300 shadow-xl ${
            showSettings 
              ? 'bg-yellow-500 text-black border-yellow-400' 
              : 'bg-black/60 text-white border-white/10 hover:bg-black/80 hover:border-white/30'
          }`}
          aria-label="3D Viewer Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {showSettings && (
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl w-48 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Environment Selector */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Sun className="w-3 h-3" /> Lighting
              </label>
              <div className="grid grid-cols-1 gap-1">
                {environments.map(env => (
                  <button
                    key={env.id}
                    onClick={() => setEnvironment(env.id)}
                    className={`text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      environment === env.id 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Rotate Toggle */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer" onClick={() => setAutoRotate(!autoRotate)}>
                <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin-slow' : ''}`} /> Auto Rotate
              </label>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-8 h-4 rounded-full transition-colors relative ${autoRotate ? 'bg-yellow-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${autoRotate ? 'left-4.5 translate-x-full' : 'left-0.5'}`} style={{ transform: autoRotate ? 'translateX(14px)' : 'translateX(0)' }} />
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}