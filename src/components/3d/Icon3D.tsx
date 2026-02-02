import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// 3D Shield Icon
function Shield3DGeometry({ color = '#3b82f6' }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  // Create shield shape
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
      {/* Checkmark inside shield */}
      <mesh position={[0, 0, 0.3]} scale={0.5}>
        <torusGeometry args={[0.3, 0.08, 16, 32, Math.PI * 1.5]} />
        <meshStandardMaterial color="#10b981" metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  );
}

// 3D QR Code Icon
function QRCode3DGeometry({ color = '#8b5cf6' }: { color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const cubePositions = [
    // Corner markers
    [-0.6, 0.6, 0], [0.6, 0.6, 0], [-0.6, -0.6, 0],
    // Pattern
    [0, 0, 0], [0.3, 0.3, 0], [-0.3, 0.3, 0], [0.3, -0.3, 0],
    [-0.3, 0, 0], [0, -0.3, 0], [0.6, 0, 0],
  ];

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Main frame */}
        <mesh>
          <boxGeometry args={[1.8, 1.8, 0.15]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* QR pattern cubes */}
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

// 3D Search/Magnifying Glass Icon
function Search3DGeometry({ color = '#f59e0b' }: { color?: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
      <group ref={meshRef} rotation={[0, 0, -0.5]}>
        {/* Lens */}
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
        {/* Glass */}
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
        {/* Handle */}
        <mesh position={[0.5, -0.4, 0]} rotation={[0, 0, -0.8]}>
          <cylinderGeometry args={[0.1, 0.12, 0.6, 16]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// 3D Checkmark Icon
function Checkmark3DGeometry({ color = '#10b981' }: { color?: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={meshRef}>
        {/* Circle background */}
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
        {/* Checkmark - short arm */}
        <mesh position={[-0.15, -0.05, 0.1]} rotation={[0, 0, 0.8]}>
          <boxGeometry args={[0.35, 0.12, 0.12]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Checkmark - long arm */}
        <mesh position={[0.2, 0.15, 0.1]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.6, 0.12, 0.12]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// 3D Database Icon
function Database3DGeometry({ color = '#6366f1' }: { color?: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

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

// Wrapper component for 3D icons
interface Icon3DProps {
  type: 'shield' | 'qr' | 'search' | 'check' | 'database';
  color?: string;
  size?: number;
  className?: string;
}

export function Icon3D({ type, color, size = 120, className = '' }: Icon3DProps) {
  const renderIcon = () => {
    switch (type) {
      case 'shield':
        return <Shield3DGeometry color={color} />;
      case 'qr':
        return <QRCode3DGeometry color={color} />;
      case 'search':
        return <Search3DGeometry color={color} />;
      case 'check':
        return <Checkmark3DGeometry color={color} />;
      case 'database':
        return <Database3DGeometry color={color} />;
      default:
        return <Shield3DGeometry color={color} />;
    }
  };

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'transparent' }}
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
          {renderIcon()}
        </PresentationControls>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export default Icon3D;
