import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { LaVistaKanban } from '@/components/LaVistaKanban';
import { ElPanoramaScene } from '@/components/ElPanoramaScene';
import { CouncilOrchestrator } from '@/components/CouncilOrchestrator';
import { TransitionOverlay } from '@/components/TransitionOverlay';
import { SoundToggle } from '@/components/SoundToggle';
import { DemoMode } from '@/components/DemoMode';

function AppContent() {
  const { state, dispatch, transitionToPanorama } = useApp();
  const [searchParams] = useSearchParams();

  // Auto-start demo mode if ?demo=true
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      dispatch({ type: 'SET_DEMO_MODE', payload: true });
    }
  }, [searchParams, dispatch]);

  // Keyboard shortcut: P to toggle panorama
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (state.viewMode === 'kanban') transitionToPanorama();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.viewMode, transitionToPanorama]);

  return (
    <div className="app-shell" onClick={() => {
      // Unlock audio on first interaction
      import('@/lib/sound-system').then(({ soundSystem }) => soundSystem.tryUnlockAudio());
    }}>
      {/* Kanban layer */}
      <div className={`view-layer ${state.viewMode === 'kanban' ? 'visible' : 'hidden'}`}>
        <LaVistaKanban />
      </div>

      {/* 3D Panorama layer */}
      <div className={`view-layer ${state.viewMode === 'panorama' ? 'visible' : 'hidden'}`}>
        <ElPanoramaScene />
        {/* Council overlay sits on top of 3D scene */}
        <CouncilOrchestrator />
      </div>

      {/* Global overlays */}
      <TransitionOverlay />
      <SoundToggle />
      <DemoMode />
    </div>
  );
}

export function App() {
  return <AppContent />;
}
