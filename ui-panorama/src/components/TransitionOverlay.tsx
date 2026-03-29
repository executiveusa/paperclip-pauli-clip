import React from 'react';
import { useApp } from '@/context/AppContext';

export function TransitionOverlay() {
  const { state } = useApp();
  const active = state.transitionState !== 'idle';

  return (
    <div
      className="transition-overlay"
      style={{
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'all' : 'none',
      }}
    />
  );
}
