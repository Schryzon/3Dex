'use client';

import React, { useRef, useEffect, Suspense, useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Html, useProgress, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Settings, Sun, RotateCw, AlertTriangle, Loader2 } from 'lucide-react';
import { KTX2Loader } from 'three-stdlib';
import { MeshoptDecoder } from 'meshoptimizer';

// --- Components ---

// Error Boundary to catch Three.js / Loader crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an 3D rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Loader() {
  const { progress, active } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl min-w-[180px]">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
        <div className="text-yellow-400 font-bold uppercase tracking-widest text-[10px] mb-1">
          Loading Asset
        </div>
        <div className="text-gray-400 font-mono text-xs">
          {active ? `${progress.toFixed(0)}%` : 'Initializing...'}
        </div>
      </div>
    </Html>
  );
}

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#0c0c0c] text-center p-6 rounded-xl">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-red-400 font-bold text-base mb-2 uppercase tracking-tight">Render Failed</h3>
      <p className="text-gray-500 text-xs max-w-[250px] leading-relaxed">
        The 3D model could not be displayed. This usually happens with unsupported compression or network timeouts.
      </p>
    </div>
  );
}

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const gl = useThree((state) => state.gl);

  const { scene } = useGLTF(url, true, true, (loader) => {
    // 1. DRACO
    const dracoLoader = require('three-stdlib').DRACOLoader;
    const draco = new dracoLoader();
    // Use a reliable public CDN for Draco decoders
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

  // Scene optimizations traversal
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m) {
            m.side = THREE.DoubleSide;

            // Fix for improperly exported GLTF models (common in game rips)
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

// --- Main Component ---

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
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    setIsTouch(hasTouch && isSmallScreen);
  }, []);

  const getPathFromUrl = (url: string) => {
    try { 
      const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
      return new URL(cleanUrl).pathname; 
    } catch { 
      return url; 
    }
  };
  
  const is3DModel = modelUrl && (
    /\.(glb|gltf)/i.test(getPathFromUrl(modelUrl)) || 
    modelUrl.toLowerCase().includes('.glb') || 
    modelUrl.toLowerCase().includes('.gltf') ||
    !/\.(jpg|jpeg|png|webp|gif|avif)/i.test(modelUrl.split('?')[0])
  );

  if (!is3DModel) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0c0c0c] relative">
        <img
          src={modelUrl}
          alt="Product preview"
          className="max-w-full max-h-full object-contain"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 pointer-events-none bg-black/20">
           <AlertTriangle className="w-8 h-8 mb-2 opacity-20" />
           <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black">2D Preview Mode</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-gray-900 to-[#050505] relative overflow-hidden group">
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 40 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping, 
            toneMappingExposure: 1.0,
            outputColorSpace: 'srgb',
          }}
        >
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />

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

          {/* 3D Model with auto-centering and scaling */}
          <Suspense fallback={<Loader />}>
            <Center top>
              <Model url={modelUrl} />
            </Center>
          </Suspense>

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={15}
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            makeDefault
          />
        </Canvas>
      </ErrorBoundary>

      {/* Controls Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-2.5 rounded-2xl text-[10px] text-gray-400 space-y-1 shadow-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
        {isTouch ? (
          <div className="flex flex-col gap-1.5 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-lg text-xs">👆</span>
              <span>Drag to Rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-lg text-xs">✌️</span>
              <span>Pinch to Zoom</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-lg text-xs">🖱️</span>
              <span>Left: Rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-lg text-xs">🖱️</span>
              <span>Right: Pan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-lg text-xs">⚙️</span>
              <span>Scroll: Zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* Lighting & Rotation Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl ${
            showSettings 
              ? 'bg-yellow-500 text-black border-yellow-400' 
              : 'bg-black/60 text-white border-white/10 hover:bg-black/80 hover:border-white/30'
          }`}
          aria-label="3D Viewer Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {showSettings && (
          <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl w-52 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Environment Selector */}
            <div className="mb-5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Sun className="w-3 h-3" /> Lighting Studio
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {environments.map(env => (
                  <button
                    key={env.id}
                    onClick={() => setEnvironment(env.id)}
                    className={`text-left px-3 py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer border ${
                      environment === env.id 
                        ? 'bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/20' 
                        : 'text-gray-400 bg-white/5 border-transparent hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Rotate Toggle */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 cursor-pointer" onClick={() => setAutoRotate(!autoRotate)}>
                <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin-slow text-yellow-500' : ''}`} /> Auto Rotate
              </label>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-9 h-5 rounded-full transition-all duration-300 relative ${autoRotate ? 'bg-yellow-500 shadow-lg shadow-yellow-500/30' : 'bg-gray-800'}`}
              >
                <div 
                  className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ease-out`} 
                  style={{ transform: autoRotate ? 'translateX(16px)' : 'translateX(0)' }} 
                />
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}