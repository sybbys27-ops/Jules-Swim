import { useEffect, useRef } from 'react';
import { useStore } from './store';
import SettingsPanel from './components/SettingsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import TopStatus from './components/TopStatus';
import Scene from './components/Scene';

function App() {
  const updateSimulation = useStore(state => state.updateSimulation);
  const isRunning = useStore(state => state.isRunning);
  const isFinished = useStore(state => state.isFinished);
  const lastTime = useRef<number>(performance.now());

  useEffect(() => {
    let frameId: number;

    const tick = (time: number) => {
      const dt = (time - lastTime.current) / 1000;
      lastTime.current = time;

      if (isRunning && !isFinished) {
        // limit dt to avoid large jumps if tab is inactive
        updateSimulation(Math.min(dt, 0.1));
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, isFinished, updateSimulation]);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans">
      <SettingsPanel />

      <main className="flex-1 relative">
        <TopStatus />
        <Scene />
      </main>

      <AnalyticsPanel />
    </div>
  );
}

export default App;
