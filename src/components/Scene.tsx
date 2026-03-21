import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import Swimmer from './Swimmer';

function Pool() {
  return (
    <group>
      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 10]} />
        <meshStandardMaterial color="#0088ff" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Pool grid / floor */}
      <Grid
        args={[50, 10]}
        position={[0, -2, 0]}
        cellSize={1}
        cellThickness={1}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#9d4b4b"
        fadeDistance={50}
      />

      {/* Pool walls (simplified) */}
      <mesh position={[0, -1, -5]}>
        <boxGeometry args={[50, 2, 0.1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      <mesh position={[0, -1, 5]}>
        <boxGeometry args={[50, 2, 0.1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
        <color attach="background" args={['#1a202c']} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Pool />

        <Swimmer />

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
