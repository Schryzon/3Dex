'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';

// Robust React 19 + R3F Type Declarations
declare global {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}

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
        console.error("ErrorBoundary caught an error:", error, errorInfo);
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
            <div className="flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-2xl min-w-[200px]">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(250,204,21,0.5)] mb-4" />
                <div className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-1">
                    Loading Model
                </div>
                <div className="text-gray-400 font-mono text-sm">
                    {active ? `${progress.toFixed(0)}%` : 'Processing...'}
                </div>
            </div>
        </Html>
    );
}

function ModelLoaderFallback() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0a0a]">
            <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-gray-400 text-sm font-semibold tracking-wide animate-pulse">Initializing 3D Engine...</div>
        </div>
    );
}

function ErrorFallback() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0a0a] text-center p-6 border border-red-900/50 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#450a0a_0%,transparent_100%)] opacity-30" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-red-400 font-black text-lg mb-2 uppercase tracking-wide">Failed to Load Model</h3>
                <p className="text-red-200/70 text-xs max-w-[250px] leading-relaxed">
                    The 3D model could not be rendered. It might be corrupted, using an unsupported compression, or a network timeout occurred.
                </p>
            </div>
        </div>
    );
}

function Model({ url }: { url: string }) {
    console.log(`[Model] useGLTF starting for: ${url}`);

    // Some AWS Presigned URLs have query parameters that block three.js from detecting the extension
    // react-three-fiber's useGLTF accepts an array or passes the URL straight.
    let parseUrl = url;

    // Provide a Draco draco decoder path (use a public CDN for reliable decoding)
    const { scene } = useGLTF(parseUrl, true, true, (loader) => {
        // Standard DRACO config
        const dracoLoader = require('three-stdlib').DRACOLoader;
        const draco = new dracoLoader();
        draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(draco);
    });

    console.log(`[Model] useGLTF success for: ${url}`);
    return <primitive object={scene} />;
}

function FallbackBox() {
    return (
        <mesh rotation={[0.5, 0.5, 0]}>
            <boxGeometry args={[2.5, 2.5, 2.5]} />
            <meshStandardMaterial
                color="#fbbf24"
                metalness={0.8}
                roughness={0.1}
                emissive="#78350f"
                emissiveIntensity={0.2}
            />
        </mesh>
    );
}

export default function ModelViewer3D({ modelUrl }: { modelUrl?: string }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <ModelLoaderFallback />;
    }

    const getPathFromUrl = (url: string) => {
        try { return new URL(url).pathname; } catch { return url; }
    };
    const isRealModel = modelUrl && /\.(glb|gltf)/i.test(getPathFromUrl(modelUrl));

    useEffect(() => {
        if (modelUrl) {
            console.log("[3D Viewer] Attempting to load:", modelUrl);
            console.log("[3D Viewer] Is real model check:", isRealModel);
        }
    }, [modelUrl, isRealModel]);

    return (
        <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl group min-h-[400px]">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#0a0a0a_100%)] pointer-events-none" />

            <div className="absolute inset-0">
                <ErrorBoundary fallback={<ErrorFallback />}>
                    <Canvas camera={{ position: [5, 5, 5], fov: 40 }} shadows>
                        <Suspense fallback={<Loader />}>
                            <StageSetup />

                            <Center top>
                                {isRealModel ? <Model url={modelUrl} /> : <FallbackBox />}
                            </Center>

                            {/* Spatial reference helpers */}
                            <gridHelper args={[20, 20, '#333', '#181818']} position={[0, -0.01, 0]} />

                            <OrbitControls
                                makeDefault
                                autoRotate
                                autoRotateSpeed={0.5}
                                enableDamping
                                dampingFactor={0.05}
                                minDistance={1}
                                maxDistance={25}
                            />

                            <Environment preset="city" />

                            <ContactShadows
                                position={[0, -0.01, 0]}
                                opacity={0.4}
                                scale={10}
                                blur={2.5}
                                far={10}
                                color="#000000"
                            />
                        </Suspense>
                    </Canvas>
                </ErrorBoundary>
            </div>

            {/* Floating UI */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] opacity-80">3Dex Engine</span>
                <span className="text-[8px] text-gray-500 font-mono">
                    {isRealModel ? 'GLB_STREAM_ACTIVE' : 'VIRTUAL_MESH_DEFAULT'}
                </span>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 text-[10px] text-gray-300">
                    <span>Left: Rotate</span>
                    <div className="w-px h-2 bg-gray-700" />
                    <span>Right: Pan</span>
                    <div className="w-px h-2 bg-gray-700" />
                    <span>Scroll: Zoom</span>
                </div>
            </div>
        </div>
    );
}

function StageSetup() {
    return (
        <>
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={5} color="#450a0a" />
            <directionalLight position={[0, 5, 0]} intensity={2} />
        </>
    );
}
