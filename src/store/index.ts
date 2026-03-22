import { create } from 'zustand';

type ArmPhase = 'Idle' | 'Catch' | 'Pull' | 'Push' | 'Recovery' | 'ExtendedForward';
type SystemState = 'Stopped' | 'InitialRollToRightMax' | 'InitialGlideHold' | 'Running' | 'Finished';

export interface State {
  rollingAngle: number;
  strokeInterval: number;
  glideHold: number;
  bodyPitch: number;

  isRunning: boolean;
  isStopped: boolean;
  isFinished: boolean;
  elapsedTime: number;
  virtualDistance: number;

  currentSpeedKmh: number;
  currentSpeedMps: number;

  currentRollAngle: number;
  rollingDirection: 1 | -1 | 0;
  currentPitch: number;

  currentState: SystemState;
  activeArm: 'Left' | 'Right' | 'Both' | 'None';
  leftArmPhase: ArmPhase;
  rightArmPhase: ArmPhase;

  leftArmTimeInCycle: number;
  rightArmTimeInCycle: number;

  glideHoldRemaining: number;
  strokeDuration: number;
  overlapDuration: number;

  firstStrokeStarted: boolean;
  rollIndicatorAngle: number;

  result50mTime: number;
  resultFinalSpeed: number;

  setRollingAngle: (v: number) => void;
  setStrokeInterval: (v: number) => void;
  setGlideHold: (v: number) => void;
  setBodyPitch: (v: number) => void;

  startSimulation: () => void;
  stopSimulation: () => void;
  updateSimulation: (dt: number) => void;
}

const ROLL_SPEED = 30; // 30 degrees per second
const MIN_SPEED_KMH = 1.5;

function determinePhase(time: number): ArmPhase {
  if (time < 0) return 'ExtendedForward'; // or Idle
  if (time < 0.5) return 'Catch';
  if (time < 1.0) return 'Pull';
  if (time < 2.0) return 'Push';
  if (time < 4.0) return 'Recovery';
  return 'ExtendedForward';
}

function calculateSpeedBoost(rollAngle: number, pitch: number): number {
  let boost = 0;
  // Rule: deep underwater start
  if (rollAngle <= -50) boost = 0.20;
  else if (rollAngle <= -40) boost = 0.15;
  else if (rollAngle <= -30) boost = 0.10;
  else if (rollAngle < 0) boost = 0.05;
  else boost = -0.20; // Above water start

  // Pitch modifier
  let modifier = 1.0;
  if (pitch >= -1 && pitch <= 1) modifier = 1.5;
  else if (pitch <= -4 || pitch >= 4) modifier = 0.5;

  return boost * modifier;
}

export const useStore = create<State>((set, get) => ({
  rollingAngle: 45,
  strokeInterval: 4.0,
  glideHold: 1.0,
  bodyPitch: 0,

  isRunning: false,
  isStopped: true,
  isFinished: false,
  elapsedTime: 0,
  virtualDistance: 0,

  currentSpeedKmh: MIN_SPEED_KMH,
  currentSpeedMps: MIN_SPEED_KMH / 3.6,

  currentRollAngle: 0,
  rollingDirection: 0,
  currentPitch: 0,

  currentState: 'Stopped',
  activeArm: 'None',
  leftArmPhase: 'ExtendedForward',
  rightArmPhase: 'ExtendedForward',

  leftArmTimeInCycle: -1,
  rightArmTimeInCycle: -1,

  glideHoldRemaining: 0,
  strokeDuration: 4.0,
  overlapDuration: 0,

  firstStrokeStarted: false,
  rollIndicatorAngle: 0,

  result50mTime: 0,
  resultFinalSpeed: 0,

  setRollingAngle: (v) => set({ rollingAngle: v }),
  setStrokeInterval: (v) => set({ strokeInterval: v }),
  setGlideHold: (v) => set({ glideHold: v }),
  setBodyPitch: (v) => set({ bodyPitch: v }),

  startSimulation: () => {
    const s = get();
    set({
      isRunning: true,
      isStopped: false,
      isFinished: false,
      elapsedTime: 0,
      virtualDistance: 0,
      currentSpeedKmh: MIN_SPEED_KMH,
      currentSpeedMps: MIN_SPEED_KMH / 3.6,
      currentRollAngle: 0,
      rollingDirection: 1, // Start rolling right
      currentPitch: s.bodyPitch,
      currentState: 'InitialRollToRightMax',
      activeArm: 'None',
      leftArmPhase: 'ExtendedForward',
      rightArmPhase: 'ExtendedForward',
      leftArmTimeInCycle: -1,
      rightArmTimeInCycle: -1,
      glideHoldRemaining: 0,
      firstStrokeStarted: false,
      rollIndicatorAngle: 0,
      overlapDuration: Math.max(0, 4.0 - s.strokeInterval)
    });
  },

  stopSimulation: () => {
    set({
      isRunning: false,
      isStopped: true,
      currentState: 'Stopped',
      currentRollAngle: 0,
      rollingDirection: 0,
      currentSpeedKmh: MIN_SPEED_KMH,
      currentSpeedMps: MIN_SPEED_KMH / 3.6,
      leftArmPhase: 'ExtendedForward',
      rightArmPhase: 'ExtendedForward',
      leftArmTimeInCycle: -1,
      rightArmTimeInCycle: -1,
      activeArm: 'None',
      glideHoldRemaining: 0
    });
  },

  updateSimulation: (dt) => {
    const s = get();
    if (!s.isRunning || s.currentState === 'Finished') return;

    let {
      currentState,
      currentRollAngle,
      rollingDirection,
      glideHoldRemaining,
      leftArmTimeInCycle,
      rightArmTimeInCycle,
      currentSpeedKmh,
      elapsedTime,
      virtualDistance,
      firstStrokeStarted
    } = s;
    const { rollingAngle, glideHold, strokeInterval, bodyPitch } = s;

    elapsedTime += dt;

    if (currentState === 'InitialRollToRightMax') {
      currentRollAngle += ROLL_SPEED * dt * rollingDirection;
      if (currentRollAngle >= rollingAngle) {
        currentRollAngle = rollingAngle;
        currentState = 'InitialGlideHold';
        glideHoldRemaining = glideHold;

        // If glideHold is 0, we can immediately transition
        if (glideHoldRemaining <= 0) {
          currentState = 'Running';
          rollingDirection = -1;
          leftArmTimeInCycle = 0;
          firstStrokeStarted = true;
          currentSpeedKmh = Math.max(MIN_SPEED_KMH, currentSpeedKmh + calculateSpeedBoost(-currentRollAngle, bodyPitch));
        }
      }
    } else if (currentState === 'InitialGlideHold') {
      glideHoldRemaining -= dt;
      if (glideHoldRemaining <= 0) {
        currentState = 'Running';
        rollingDirection = -1; // Start rolling left
        // Left hand starts first stroke
        leftArmTimeInCycle = 0;
        firstStrokeStarted = true;
        currentSpeedKmh = Math.max(MIN_SPEED_KMH, currentSpeedKmh + calculateSpeedBoost(-currentRollAngle, bodyPitch));
      }
    } else if (currentState === 'Running') {
      // 1. Glide Hold
      if (glideHoldRemaining > 0) {
        glideHoldRemaining -= dt;
        if (glideHoldRemaining <= 0) {
          // Flip rolling direction
          rollingDirection = currentRollAngle > 0 ? -1 : 1;
        }
      } else {
        // 2. Rolling
        currentRollAngle += ROLL_SPEED * dt * rollingDirection;
        if (rollingDirection === 1 && currentRollAngle >= rollingAngle) {
          currentRollAngle = rollingAngle;
          glideHoldRemaining = glideHold;
          if (glideHoldRemaining <= 0) {
            rollingDirection = -1;
          }
        } else if (rollingDirection === -1 && currentRollAngle <= -rollingAngle) {
          currentRollAngle = -rollingAngle;
          glideHoldRemaining = glideHold;
          if (glideHoldRemaining <= 0) {
            rollingDirection = 1;
          }
        }
      }

      // 3. Stroke Scheduler
      // Arms repeat strictly every (2 * strokeInterval). They are offset by strokeInterval.
      if (leftArmTimeInCycle >= 0) {
        const prevTime = leftArmTimeInCycle;
        leftArmTimeInCycle += dt;

        // Right arm is triggered precisely at strokeInterval from left arm's cycle.
        if (prevTime < strokeInterval && leftArmTimeInCycle >= strokeInterval) {
          rightArmTimeInCycle = 0;
          currentSpeedKmh = Math.max(MIN_SPEED_KMH, currentSpeedKmh + calculateSpeedBoost(currentRollAngle, bodyPitch));
        }

        // Reset left arm cycle when it reaches 2 * strokeInterval
        if (leftArmTimeInCycle >= strokeInterval * 2) {
          leftArmTimeInCycle -= strokeInterval * 2;
          currentSpeedKmh = Math.max(MIN_SPEED_KMH, currentSpeedKmh + calculateSpeedBoost(-currentRollAngle, bodyPitch));
        }
      }

      if (rightArmTimeInCycle >= 0) {
        rightArmTimeInCycle += dt;
        if (rightArmTimeInCycle >= strokeInterval * 2) {
          rightArmTimeInCycle -= strokeInterval * 2;
        }
      }
    }

    const currentSpeedMps = currentSpeedKmh / 3.6;
    virtualDistance += currentSpeedMps * dt;

    if (virtualDistance >= 50 && (currentState as string) !== 'Finished') {
      set({
        currentState: 'Finished',
        isFinished: true,
        isRunning: false,
        virtualDistance: 50,
        result50mTime: elapsedTime,
        resultFinalSpeed: currentSpeedKmh,
        currentSpeedKmh: 0,
        currentSpeedMps: 0
      });
      return;
    }

    const leftPhase = determinePhase(leftArmTimeInCycle);
    const rightPhase = determinePhase(rightArmTimeInCycle);

    let activeArm: 'Left' | 'Right' | 'Both' | 'None' = 'None';
    const isLeftActive = leftPhase !== 'ExtendedForward' && leftPhase !== 'Idle';
    const isRightActive = rightPhase !== 'ExtendedForward' && rightPhase !== 'Idle';
    if (isLeftActive && isRightActive) activeArm = 'Both';
    else if (isLeftActive) activeArm = 'Left';
    else if (isRightActive) activeArm = 'Right';

    set({
      currentState,
      currentRollAngle,
      rollingDirection,
      glideHoldRemaining,
      leftArmTimeInCycle,
      rightArmTimeInCycle,
      currentSpeedKmh,
      currentSpeedMps,
      elapsedTime,
      virtualDistance,
      firstStrokeStarted,
      leftArmPhase: leftPhase,
      rightArmPhase: rightPhase,
      activeArm,
      rollIndicatorAngle: currentRollAngle
    });
  }
}));
