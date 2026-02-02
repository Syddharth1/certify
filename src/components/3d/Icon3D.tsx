import { useRef, useState, useEffect, Component, ReactNode } from 'react';
import { Shield, QrCode, Search, CheckCircle, Database, Loader2 } from 'lucide-react';

// Error Boundary for 3D components
class ThreeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('3D component failed to load:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Fallback 2D icons when 3D fails
function FallbackIcon({ type, size, color }: { type: string; size: number; color: string }) {
  const iconSize = size * 0.5;
  const iconProps = { size: iconSize, color, strokeWidth: 1.5 };
  
  return (
    <div 
      className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse"
      style={{ width: size, height: size }}
    >
      {type === 'shield' && <Shield {...iconProps} />}
      {type === 'qr' && <QrCode {...iconProps} />}
      {type === 'search' && <Search {...iconProps} />}
      {type === 'check' && <CheckCircle {...iconProps} />}
      {type === 'database' && <Database {...iconProps} />}
    </div>
  );
}

// Dynamic import wrapper for Three.js components
function ThreeIcon({ type, color, size }: { type: string; color: string; size: number }) {
  const [ThreeComponents, setThreeComponents] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadThree = async () => {
      try {
        // Dynamic imports to prevent SSR issues and handle failures gracefully
        const [fiber, drei, THREE] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('three')
        ]);
        
        if (mounted) {
          setThreeComponents({ fiber, drei, THREE });
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load Three.js:', err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadThree();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ThreeComponents) {
    return <FallbackIcon type={type} size={size} color={color} />;
  }

  const { Canvas } = ThreeComponents.fiber;
  const { Float, MeshTransmissionMaterial, Environment, PresentationControls } = ThreeComponents.drei;
  const THREE = ThreeComponents.THREE;

  return (
    <ThreeErrorBoundary fallback={<FallbackIcon type={type} size={size} color={color} />}>
      <div style={{ width: size, height: size }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <IconGeometry type={type} color={color} THREE={THREE} Float={Float} MeshTransmissionMaterial={MeshTransmissionMaterial} />
          </PresentationControls>
          <Environment preset="city" />
        </Canvas>
      </div>
    </ThreeErrorBoundary>
  );
}

// Geometry components
function IconGeometry({ type, color, THREE, Float, MeshTransmissionMaterial }: any) {
  switch (type) {
    case 'shield':
      return <ShieldGeometry color={color} THREE={THREE} Float={Float} MeshTransmissionMaterial={MeshTransmissionMaterial} />;
    case 'qr':
      return <QRCodeGeometry color={color} THREE={THREE} Float={Float} MeshTransmissionMaterial={MeshTransmissionMaterial} />;
    case 'search':
      return <SearchGeometry color={color} THREE={THREE} Float={Float} MeshTransmissionMaterial={MeshTransmissionMaterial} />;
    case 'check':
      return <CheckmarkGeometry color={color} THREE={THREE} Float={Float} MeshTransmissionMaterial={MeshTransmissionMaterial} />;
    case 'database':
      return <DatabaseGeometry color={color} THREE={THREE} Float={Float} MeshTransmissionMaterial={MeshTransmissionMaterial} />;
    default:
      return <ShieldGeometry color={color} THREE={THREE} Float={Float} MeshTransmissionMaterial={MeshTransmissionMaterial} />;
  }
}

function ShieldGeometry({ color, THREE, Float, MeshTransmissionMaterial }: any) {
  const meshRef = useRef<any>(null);

  const shape = new THREE.Shape();
  shape.moveTo(0, 1.2);
  shape.bezierCurveTo(0.8, 1.1, 1, 0.8, 1, 0.3);
  shape.bezierCurveTo(1, -0.3, 0.6, -0.8, 0, -1.2);
  shape.bezierCurveTo(-0.6, -0.8, -1, -0.3, -1, 0.3);
  shape.bezierCurveTo(-1, 0.8, -0.8, 1.1, 0, 1.2);

  const extrudeSettings = {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 5,
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={0.8}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.2}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color={color}
        />
      </mesh>
      <mesh position={[0, 0, 0.3]} scale={0.5}>
        <torusGeometry args={[0.3, 0.08, 16, 32, Math.PI * 1.5]} />
        <meshStandardMaterial color="#10b981" metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  );
}

function QRCodeGeometry({ color, THREE, Float, MeshTransmissionMaterial }: any) {
  const groupRef = useRef<any>(null);

  const cubePositions = [
    [-0.6, 0.6, 0], [0.6, 0.6, 0], [-0.6, -0.6, 0],
    [0, 0, 0], [0.3, 0.3, 0], [-0.3, 0.3, 0], [0.3, -0.3, 0],
    [-0.3, 0, 0], [0, -0.3, 0], [0.6, 0, 0],
  ];

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[1.8, 1.8, 0.15]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
        </mesh>
        {cubePositions.map((pos, i) => (
          <mesh key={i} position={[pos[0], pos[1], 0.15]}>
            <boxGeometry args={[0.25, 0.25, 0.15]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.3}
              chromaticAberration={0.1}
              color={color}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function SearchGeometry({ color, THREE, Float, MeshTransmissionMaterial }: any) {
  const meshRef = useRef<any>(null);

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
      <group ref={meshRef} rotation={[0, 0, -0.5]}>
        <mesh position={[0, 0.2, 0]}>
          <torusGeometry args={[0.5, 0.12, 16, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={0.3}
            color={color}
          />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <circleGeometry args={[0.4, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.2}
            chromaticAberration={0.5}
            transmission={0.9}
            color="#ffffff"
          />
        </mesh>
        <mesh position={[0.5, -0.4, 0]} rotation={[0, 0, -0.8]}>
          <cylinderGeometry args={[0.1, 0.12, 0.6, 16]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function CheckmarkGeometry({ color, THREE, Float, MeshTransmissionMaterial }: any) {
  const meshRef = useRef<any>(null);

  return (
    <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={meshRef}>
        <mesh>
          <torusGeometry args={[0.8, 0.15, 16, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.4}
            chromaticAberration={0.2}
            color={color}
          />
        </mesh>
        <mesh position={[-0.15, -0.05, 0.1]} rotation={[0, 0, 0.8]}>
          <boxGeometry args={[0.35, 0.12, 0.12]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.2, 0.15, 0.1]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.6, 0.12, 0.12]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function DatabaseGeometry({ color, THREE, Float, MeshTransmissionMaterial }: any) {
  const meshRef = useRef<any>(null);

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={meshRef}>
        {[0.6, 0, -0.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.35, 32]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.3}
              chromaticAberration={0.15}
              color={color}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Main exported component
interface Icon3DProps {
  type: 'shield' | 'qr' | 'search' | 'check' | 'database';
  color?: string;
  size?: number;
  className?: string;
}

export function Icon3D({ type, color = '#3b82f6', size = 120, className = '' }: Icon3DProps) {
  return (
    <div className={className}>
      <ThreeIcon type={type} color={color} size={size} />
    </div>
  );
}

export default Icon3D;
