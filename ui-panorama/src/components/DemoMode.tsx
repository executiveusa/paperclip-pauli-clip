import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { soundSystem } from '@/lib/sound-system';
import type { SubAgentInfo } from '@/lib/types';

// ═══ DEMO SCRIPT ═══

interface DemoStep {
  t: number;
  action: string;
  text?: string;
  duration: number;
  payload?: unknown;
}

const DEMO_SCRIPT: DemoStep[] = [
  { t: 0,     action: 'narrate',        text: 'Bienvenido a PAULI-CLIP™ — donde tus agentes razonan.', duration: 3000 },
  { t: 3000,  action: 'show_kanban',    text: 'La Vista — tu centro de comando.', duration: 2000 },
  { t: 5000,  action: 'create_mission', text: 'Nueva misión: 10 restaurantes veganos en Puerto Vallarta.', duration: 1500 },
  { t: 6500,  action: 'spawn_subs',     text: 'Research-Esfera activa 3 sub-agentes...', duration: 2000,
    payload: { parentId: 'research-esfera', count: 3 } },
  { t: 8500,  action: 'to_3d',          text: 'Se requiere Consejo. Entrando a El Panorama...', duration: 3000 },
  { t: 11500, action: 'start_council',  text: 'Consejo iniciado.', duration: 10000 },
  { t: 21500, action: 'dissolve_subs',  text: 'Sub-agentes completan. Ceremonia de gratitud.', duration: 4000 },
  { t: 25500, action: 'to_kanban',      text: 'Regresando a La Vista. Misión completa.', duration: 2500 },
  { t: 28000, action: 'show_result',    text: '10 sitios construidos. 10 negocios notificados. 28 horas.', duration: 5000 },
  { t: 33000, action: 'end_demo',       text: '', duration: 0 },
];

// ═══ DEMO NARRATOR OVERLAY ═══

function NarratorOverlay({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="narrator-overlay">
      <p className="narrator-text">{text}</p>
    </div>
  );
}

// ═══ DEMO MODE CONTROLLER ═══

export function DemoMode() {
  const { state, dispatch, transitionToPanorama, transitionToKanban, startCouncil, dissolveSubAgent, spawnSubAgent } = useApp();
  const [narratorText, setNarratorText] = useState('');
  const [subIds, setSubIds] = useState<string[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const exitDemo = () => {
    clearAll();
    dispatch({ type: 'SET_DEMO_MODE', payload: false });
    setNarratorText('');
    setSubIds([]);
  };

  useEffect(() => {
    if (!state.demoMode) return;

    DEMO_SCRIPT.forEach((step) => {
      const t = setTimeout(() => {
        if (step.text) setNarratorText(step.text);

        switch (step.action) {
          case 'narrate':
            break;

          case 'show_kanban':
            transitionToKanban();
            break;

          case 'create_mission':
            dispatch({
              type: 'UPDATE_MISION',
              payload: {
                id: 'm1',
                columna: 'en_ronda',
                proximoPaso: 'Ejecutando scraper en Google Maps PV...',
              },
            });
            break;

          case 'spawn_subs': {
            const p = step.payload as { parentId: 'research-esfera'; count: number };
            const ids: string[] = [];
            for (let i = 0; i < p.count; i++) {
              const id = `demo-sub-${Date.now()}-${i}`;
              ids.push(id);
              const sa: SubAgentInfo = {
                id,
                parentId: p.parentId,
                taskLabel: `Research sub-task ${i + 1}`,
                status: 'working',
                position: {
                  x: (i - 1) * 2.5,
                  y: SCENE_CONFIG_Y,
                  z: 6,
                },
              };
              spawnSubAgent(sa);
            }
            setSubIds(ids);
            break;
          }

          case 'to_3d':
            transitionToPanorama();
            break;

          case 'start_council':
            startCouncil('m6');
            soundSystem.playEvent('council_start');
            break;

          case 'dissolve_subs':
            subIds.forEach((id) => dissolveSubAgent(id));
            break;

          case 'to_kanban':
            transitionToKanban();
            break;

          case 'show_result':
            dispatch({
              type: 'UPDATE_MISION',
              payload: { id: 'm1', columna: 'listo', tokenCost: 6.4 },
            });
            break;

          case 'end_demo':
            setNarratorText('');
            dispatch({ type: 'SET_DEMO_MODE', payload: false });
            break;
        }
      }, step.t);
      timeoutsRef.current.push(t);
    });

    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.demoMode]);

  if (!state.demoMode) return null;

  return (
    <>
      <NarratorOverlay text={narratorText} />
      <button className="btn-exit-demo" onClick={exitDemo}>
        EXIT DEMO
      </button>
    </>
  );
}

// Y float height constant used in spawn
const SCENE_CONFIG_Y = 1.15;
