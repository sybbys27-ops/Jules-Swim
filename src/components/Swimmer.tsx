import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import * as THREE from 'three';


// Helper for interpolation
function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

// Calculate joint angles based on arm phase
// We return [shoulderRotZ, shoulderRotY, elbowRotZ]
function getArmKinematics(timeInCycle: number, isLeft: boolean) {
  if (timeInCycle < 0 || timeInCycle >= 4.0) {
    // Extended Forward (Streamline)
    return { shoulderZ: Math.PI, shoulderY: 0, elbowZ: 0 };
  }

  // Phase 1: Catch (0 - 0.5s)
  if (timeInCycle < 0.5) {
    const t = timeInCycle / 0.5; // 0 to 1
    // Arm drops slightly down and out
    return {
      shoulderZ: lerp(Math.PI, Math.PI - 0.5, t),
      shoulderY: lerp(0, isLeft ? -0.2 : 0.2, t),
      elbowZ: lerp(0, -0.5, t)
    };
  }

  // Phase 2: Pull (0.5 - 1.0s)
  if (timeInCycle < 1.0) {
    const t = (timeInCycle - 0.5) / 0.5;
    // Arm pulls straight down under body
    return {
      shoulderZ: lerp(Math.PI - 0.5, Math.PI / 2, t),
      shoulderY: lerp(isLeft ? -0.2 : 0.2, 0, t),
      elbowZ: lerp(-0.5, -1.0, t)
    };
  }

  // Phase 3: Push / Finish (1.0 - 2.0s)
  if (timeInCycle < 2.0) {
    const t = (timeInCycle - 1.0) / 1.0;
    // Arm pushes back to thigh
    return {
      shoulderZ: lerp(Math.PI / 2, 0, t),
      shoulderY: 0,
      elbowZ: lerp(-1.0, 0, t)
    };
  }

  // Phase 4: Recovery (2.0 - 4.0s)
  if (timeInCycle < 4.0) {
    const t = (timeInCycle - 2.0) / 2.0;
    // Arm lifts out of water, swings forward.
    // To swing out, we use shoulderY.
    // Lifting up and forward = shoulderZ goes 0 -> Math.PI
    // High elbow = elbowZ bends, then straightens
    return {
      shoulderZ: lerp(0, Math.PI, t),
      shoulderY: lerp(0, isLeft ? -0.5 : 0.5, Math.sin(t * Math.PI)), // Swing wide
      elbowZ: lerp(0, -1.5, Math.sin(t * Math.PI)) // High elbow in middle
    };
  }

  return { shoulderZ: Math.PI, shoulderY: 0, elbowZ: 0 };
}

export default function Swimmer() {
  const containerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);

  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const state = useStore.getState();
    const time = clock.getElapsedTime();

    // Body Pitch and Roll
    if (bodyRef.current) {
      bodyRef.current.rotation.x = THREE.MathUtils.degToRad(state.currentRollAngle);
      bodyRef.current.rotation.z = THREE.MathUtils.degToRad(state.currentPitch);
    }

    // Arm Kinematics
    const leftKin = getArmKinematics(state.leftArmTimeInCycle, true);
    if (leftShoulderRef.current && leftElbowRef.current) {
      leftShoulderRef.current.rotation.z = leftKin.shoulderZ;
      leftShoulderRef.current.rotation.y = leftKin.shoulderY;
      leftElbowRef.current.rotation.z = leftKin.elbowZ;
    }

    const rightKin = getArmKinematics(state.rightArmTimeInCycle, false);
    if (rightShoulderRef.current && rightElbowRef.current) {
      rightShoulderRef.current.rotation.z = rightKin.shoulderZ;
      rightShoulderRef.current.rotation.y = rightKin.shoulderY;
      rightElbowRef.current.rotation.z = rightKin.elbowZ;
    }

    // Legs - Flutter kick
    if (leftLegRef.current && rightLegRef.current) {
      const kickSpeed = state.isRunning && !state.isFinished ? 5 : 2; // slow kick if stopped
      const kickAmp = 0.2;
      leftLegRef.current.rotation.z = Math.sin(time * kickSpeed) * kickAmp;
      rightLegRef.current.rotation.z = Math.cos(time * kickSpeed) * kickAmp;
    }
  });

  return (
    <group position={[0, 0, 0]} ref={containerRef}>
      {/* Container for the swimmer that handles global position and pitch */}
      <group ref={bodyRef}>

        {/* Core Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.4, 0.6]} /> {/* Length, Depth, Width */}
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Head */}
        <mesh position={[0.9, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Left Arm Assembly */}
        <group position={[0.6, 0, -0.4]}>
          {/* Shoulder pivot */}
          <group ref={leftShoulderRef}>
            <mesh position={[0.35, 0, 0]}>
              <boxGeometry args={[0.7, 0.15, 0.15]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
            </mesh>
            {/* Elbow pivot */}
            <group position={[0.7, 0, 0]} ref={leftElbowRef}>
              <mesh position={[0.35, 0, 0]}>
                <boxGeometry args={[0.7, 0.12, 0.12]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Right Arm Assembly */}
        <group position={[0.6, 0, 0.4]}>
          {/* Shoulder pivot */}
          <group ref={rightShoulderRef}>
            <mesh position={[0.35, 0, 0]}>
              <boxGeometry args={[0.7, 0.15, 0.15]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
            </mesh>
            {/* Elbow pivot */}
            <group position={[0.7, 0, 0]} ref={rightElbowRef}>
              <mesh position={[0.35, 0, 0]}>
                <boxGeometry args={[0.7, 0.12, 0.12]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Legs Assembly */}
        <group position={[-0.75, 0, 0]}>
          {/* Left Leg */}
          <group position={[0, 0, -0.15]} ref={leftLegRef}>
            <mesh position={[-0.6, 0, 0]}>
              <boxGeometry args={[1.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
            </mesh>
          </group>
          {/* Right Leg */}
          <group position={[0, 0, 0.15]} ref={rightLegRef}>
            <mesh position={[-0.6, 0, 0]}>
              <boxGeometry args={[1.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
            </mesh>
          </group>
        </group>

      </group>
    </group>
  );
}
