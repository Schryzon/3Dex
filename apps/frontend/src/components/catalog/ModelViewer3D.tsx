'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Environment, ContactShadows } from '@react-three/drei';

// Robust React 19 + R3F Type Declarations
declare global {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}

function Model({ url }: { url: string }) {
    // Safe loader for GLTF/GLB
    try {
        const { scene } = useGLTF(url);
        return <primitive object={scene} />;
    } catch (e) {
        console.error("3D Model Load Error:", e);
        return (
            <mesh>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#fca5a5" metalness={0.5} roughness={0.2} />
            </mesh>
        );
    }
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
        return (
            <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isRealModel = modelUrl && (modelUrl.endsWith('.glb') || modelUrl.endsWith('.gltf'));

    return (
        <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl group">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#0a0a0a_100%)] pointer-events-none" />

            <div className="absolute inset-0">
                <Canvas camera={{ position: [5, 5, 5], fov: 40 }} shadows>
                    <Suspense fallback={null}>
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
                            minDistance={3}
                            maxDistance={15}
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
