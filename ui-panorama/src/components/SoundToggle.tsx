import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { soundSystem } from '@/lib/sound-system';

export function SoundToggle() {
  const { state, dispatch } = useApp();
  const isSound = state.soundMode === 'sound';

  const toggle = () => {
    const next = isSound ? 'silent' : 'sound';
    dispatch({ type: 'SET_SOUND_MODE', payload: next });
    soundSystem.setEnabled(next === 'sound');
    soundSystem.tryUnlockAudio();
    localStorage.setItem('panorama-sound-mode', next);
  };

  // Init sound system on mount
  useEffect(() => {
    const saved = localStorage.getItem('panorama-sound-mode') as 'sound' | 'silent' | null;
    const initial = saved ?? 'silent';
    dispatch({ type: 'SET_SOUND_MODE', payload: initial });
    soundSystem.init(initial === 'sound');
  }, [dispatch]);

  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      title={isSound ? 'Silenciar' : 'Activar sonido'}
      aria-label={isSound ? 'Silenciar' : 'Activar sonido'}
    >
      {isSound ? '🔊' : '🔇'}
    </button>
  );
}
