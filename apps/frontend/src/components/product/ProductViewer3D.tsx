'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  modelUrl: string;
}

export default function ProductViewer3D({ modelUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [controls, setControls] = useState({
    wireframe: false,
    autoRotate: false,
    showGrid: true,
  });

  useEffect(() => {
    // Load Three.js and initialize 3D viewer
    loadThreeJS();
  }, [modelUrl]);

  const loadThreeJS = async () => {
    try {
      setLoading(true);
      setError(false);

      // Import Three.js dynamically
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');

      if (!containerRef.current) return;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        45,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(5, 5, 5);

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      containerRef.current.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight2.position.set(-10, 5, -5);
      scene.add(directionalLight2);

      // Grid helper
      const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
      scene.add(gridHelper);

      // Controls
      const orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.05;
      orbitControls.autoRotate = controls.autoRotate;
      orbitControls.autoRotateSpeed = 2.0;

      // Load model
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;

          // Center the model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);

          // Scale to fit
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3 / maxDim;
          model.scale.setScalar(scale);

          scene.add(model);
          setLoading(false);
        },
        (progress) => {
          // Loading progress
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log(`Loading: ${percentComplete.toFixed(2)}%`);
        },
        (error) => {
          console.error('Error loading model:', error);
          setError(true);
          setLoading(false);
        }
      );

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        orbitControls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.error('Error initializing 3D viewer:', err);
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[600px]">
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading 3D Model...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-400">Failed to load 3D model</p>
            <button
              onClick={() => loadThreeJS()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
          <button
            onClick={() => setControls({ ...controls, wireframe: !controls.wireframe })}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-all w-full ${
              controls.wireframe ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span className="text-sm">Wireframe</span>
          </button>

          <button
            onClick={() => setControls({ ...controls, autoRotate: !controls.autoRotate })}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-all w-full ${
              controls.autoRotate ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm">Auto Rotate</span>
          </button>

          <button
            onClick={() => setControls({ ...controls, showGrid: !controls.showGrid })}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-all w-full ${
              controls.showGrid ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span className="text-sm">Grid</span>
          </button>
        </div>
      )}

      {/* Info Overlay */}
      {!loading && !error && (
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-white">Left Click:</span> Rotate • 
            <span className="font-semibold text-white"> Right Click:</span> Pan • 
            <span className="font-semibold text-white"> Scroll:</span> Zoom
          </p>
        </div>
      )}
    </div>
  );
}