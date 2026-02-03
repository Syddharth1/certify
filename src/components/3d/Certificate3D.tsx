import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Award, Loader2 } from 'lucide-react';

// Lazy load Three.js components
const LazyCanvas = React.lazy(() => 
  import('@react-three/fiber').then(mod => ({ default: mod.Canvas }))
);

// The actual 3D model component using the uploaded GLB
const CertificateModel = () => {
  const groupRef = useRef<any>(null);
  const [scene, setScene] = useState<any>(null);
  const [OrbitControls, setOrbitControls] = useState<any>(null);

  useEffect(() => {
    // Load drei components and the GLB model dynamically
    import('@react-three/drei').then(async (drei) => {
      setOrbitControls(() => drei.OrbitControls);
      
      // Load the GLB model
      const gltfLoader = new (await import('three')).ObjectLoader();
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      
      loader.load(
        '/models/certificate.glb',
        (gltf) => {
          setScene(gltf.scene);
        },
        undefined,
        (error) => {
          console.error('Error loading GLB:', error);
        }
      );
    });
  }, []);

  // Auto-rotation animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.005;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#fef3c7" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#ffffff" />
      <spotLight position={[0, 10, 0]} intensity={0.4} angle={0.5} />

      {/* The 3D Model */}
      <group ref={groupRef} scale={1.5}>
        {scene ? (
          <primitive object={scene} />
        ) : (
          // Loading placeholder
          <mesh>
            <boxGeometry args={[2, 1.5, 0.1]} />
            <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
          </mesh>
        )}
      </group>

      {/* OrbitControls for user interaction */}
      {OrbitControls && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      )}
    </>
  );
};

// Error boundary for 3D rendering
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Fallback 2D certificate
const FallbackCertificate = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-64 h-44 bg-white rounded-xl shadow-2xl border-4 border-accent-gold transform rotate-3 hover:rotate-0 transition-transform duration-500">
      <div className="absolute inset-2 border-2 border-primary/20 rounded-lg">
        <div className="absolute top-3 left-0 right-0 h-6 bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">CERTIFICATE</span>
        </div>
        <div className="absolute bottom-4 right-4">
          <Award className="w-8 h-8 text-accent-gold" />
        </div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-primary/80 rounded-sm grid grid-cols-3 gap-0.5 p-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Loading component
const LoadingCertificate = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-white/50 animate-spin mx-auto mb-2" />
      <p className="text-white/50 text-sm">Loading 3D model...</p>
    </div>
  </div>
);

// Main exported component
export const Certificate3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isClient, setIsClient] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  if (!isClient) {
    return <LoadingCertificate />;
  }

  if (!webGLSupported) {
    return <FallbackCertificate />;
  }

  return (
    <div className={`${className}`}>
      <ThreeErrorBoundary fallback={<FallbackCertificate />}>
        <Suspense fallback={<LoadingCertificate />}>
          <LazyCanvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true, antialias: true }}
          >
            <CertificateModel />
          </LazyCanvas>
        </Suspense>
      </ThreeErrorBoundary>
      <p className="text-center text-white/40 text-xs mt-2">
        ✨ Drag to rotate
      </p>
    </div>
  );
};

export default Certificate3D;
