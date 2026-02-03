import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Award, Loader2 } from 'lucide-react';

// Lazy load Three.js components
const LazyCanvas = React.lazy(() => 
  import('@react-three/fiber').then(mod => ({ default: mod.Canvas }))
);

interface CertificateMeshProps {
  hovered: boolean;
}

// The actual 3D certificate component
const CertificateMesh = ({ hovered }: CertificateMeshProps) => {
  const meshRef = useRef<any>(null);
  const [Frame, setFrame] = useState<any>(null);
  const [RoundedBox, setRoundedBox] = useState<any>(null);
  const [Text3D, setText3D] = useState<any>(null);
  const [Center, setCenter] = useState<any>(null);
  const [Float, setFloat] = useState<any>(null);
  const [useFrame, setUseFrame] = useState<any>(null);

  useEffect(() => {
    // Load drei components dynamically
    Promise.all([
      import('@react-three/drei'),
      import('@react-three/fiber')
    ]).then(([drei, fiber]) => {
      setRoundedBox(() => drei.RoundedBox);
      setText3D(() => drei.Text3D);
      setCenter(() => drei.Center);
      setFloat(() => drei.Float);
      setUseFrame(() => fiber.useFrame);
    });
  }, []);

  // Custom animation using requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.003;
        meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.05;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  if (!RoundedBox || !Float) {
    return null;
  }

  const FloatComponent = Float;
  const RoundedBoxComponent = RoundedBox;

  return (
    <FloatComponent
      speed={2}
      rotationIntensity={0.3}
      floatIntensity={0.5}
    >
      <group ref={meshRef} scale={hovered ? 1.05 : 1}>
        {/* Main certificate body */}
        <RoundedBoxComponent args={[3.5, 2.5, 0.1]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.1}
            roughness={0.3}
          />
        </RoundedBoxComponent>

        {/* Gold border frame */}
        <RoundedBoxComponent args={[3.6, 2.6, 0.05]} radius={0.1} smoothness={4} position={[0, 0, -0.03]}>
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBoxComponent>

        {/* Inner decorative border */}
        <RoundedBoxComponent args={[3.2, 2.2, 0.02]} radius={0.05} smoothness={4} position={[0, 0, 0.06]}>
          <meshStandardMaterial
            color="#1a365d"
            metalness={0.3}
            roughness={0.5}
          />
        </RoundedBoxComponent>

        {/* Certificate header bar */}
        <mesh position={[0, 0.85, 0.07]}>
          <boxGeometry args={[2.8, 0.3, 0.02]} />
          <meshStandardMaterial color="#1a365d" metalness={0.2} roughness={0.4} />
        </mesh>

        {/* Text lines (simplified as rectangles) */}
        {[-0.1, -0.35, -0.55].map((y, i) => (
          <mesh key={i} position={[0, y, 0.07]}>
            <boxGeometry args={[2.2 - i * 0.4, 0.08, 0.01]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.6} />
          </mesh>
        ))}

        {/* Gold seal/ribbon */}
        <group position={[1.2, -0.8, 0.1]}>
          {/* Seal circle */}
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Star on seal */}
          <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 6]} />
            <meshStandardMaterial color="#fef3c7" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>

        {/* QR Code placeholder */}
        <group position={[-1.2, -0.75, 0.07]}>
          <mesh>
            <boxGeometry args={[0.4, 0.4, 0.02]} />
            <meshStandardMaterial color="#1f2937" metalness={0.1} roughness={0.8} />
          </mesh>
          {/* QR pattern dots */}
          {[
            [-0.1, 0.1], [0, 0.1], [0.1, 0.1],
            [-0.1, 0], [0.1, 0],
            [-0.1, -0.1], [0, -0.1], [0.1, -0.1],
          ].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.015]}>
              <boxGeometry args={[0.06, 0.06, 0.01]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      </group>
    </FloatComponent>
  );
};

// Three.js scene wrapper
const CertificateScene = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#fef3c7" />
      <pointLight position={[0, 0, 4]} intensity={0.5} color="#ffffff" />
      
      {/* Certificate */}
      <CertificateMesh hovered={hovered} />
    </group>
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
      <p className="text-white/50 text-sm">Loading 3D preview...</p>
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
            <CertificateScene />
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
