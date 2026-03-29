import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { SPHERE_IDENTITIES } from '@/lib/sphere-identities';
import {
  INITIAL_COUNCIL_STATE,
  DEFAULT_COUNCIL_MEMBERS,
  DEMO_COUNCIL_SCRIPTS,
  PHASE_DURATIONS,
  nextPhase,
  type CouncilState,
  type CouncilPhase,
} from '@/lib/council-protocol';
import { buildCouncilPanel } from '@/lib/council-protocol';
import { soundSystem } from '@/lib/sound-system';
import type { SphereId } from '@/lib/types';

// ═══ COUNCIL PHASE LABEL ═══

const PHASE_LABELS: Record<CouncilPhase, string> = {
  idle: '',
  convocatoria: 'CONVOCATORIA',
  posicion: 'RONDA I — POSICIÓN',
  replica: 'RONDA II — RÉPLICA',
  sintesis: 'RONDA III — SÍNTESIS',
  retorno: 'RETORNO',
};

// ═══ SPEECH BUBBLE ═══

function SpeechBubble({ sphereId, text, phase }: {
  sphereId: SphereId;
  text: string;
  phase: 'posicion' | 'replica';
}) {
  const identity = SPHERE_IDENTITIES[sphereId];
  return (
    <div className="speech-bubble" style={{ '--bubble-color': identity.color } as React.CSSProperties}>
      <div className="bubble-header">
        <div className="bubble-dot" style={{ backgroundColor: identity.color }} />
        <span className="bubble-name">{identity.nombre}</span>
        <span className="bubble-phase">{phase === 'posicion' ? 'POSICIÓN' : 'RÉPLICA'}</span>
      </div>
      <p className="bubble-text">{text}</p>
    </div>
  );
}

// ═══ SYNTHESIS DISPLAY ═══

function SynthesisDisplay({ text }: { text: string }) {
  return (
    <div className="synthesis-display">
      <div className="synthesis-beam" />
      <div className="synthesis-content">
        <h3 className="synthesis-label">SÍNTESIS</h3>
        <p className="synthesis-text">{text}</p>
      </div>
    </div>
  );
}

// ═══ COUNCIL PANEL (shown in 3D view) ═══

export function CouncilOrchestrator() {
  const { state, endCouncil, transitionToKanban, setSphereStatus } = useApp();
  const [council, setCouncil] = useState<CouncilState>({
    ...INITIAL_COUNCIL_STATE,
    participants: DEFAULT_COUNCIL_MEMBERS,
  });
  const [scriptIndex, setScriptIndex] = useState(0);
  const [currentSpeech, setCurrentSpeech] = useState<{
    sphereId: SphereId;
    text: string;
    phase: 'posicion' | 'replica';
  } | null>(null);
  const [synthesis, setSynthesis] = useState<string | null>(null);

  const panel = buildCouncilPanel(DEFAULT_COUNCIL_MEMBERS);

  // Auto-advance phases
  const advancePhase = useCallback(() => {
    setCouncil((prev) => {
      const next = nextPhase(prev.phase);
      return { ...prev, phase: next, phaseStartedAt: Date.now() };
    });
  }, []);

  // Run council sequence when active
  useEffect(() => {
    if (!state.councilActive) {
      setCouncil({ ...INITIAL_COUNCIL_STATE, participants: DEFAULT_COUNCIL_MEMBERS });
      setScriptIndex(0);
      setCurrentSpeech(null);
      setSynthesis(null);
      return;
    }

    // Start convocatoria phase
    setCouncil((prev) => ({ ...prev, phase: 'convocatoria', phaseStartedAt: Date.now() }));
    soundSystem.playEvent('council_start');
  }, [state.councilActive]);

  // Phase automaton
  useEffect(() => {
    if (!state.councilActive || council.phase === 'idle') return;

    const duration = PHASE_DURATIONS[council.phase];

    if (council.phase === 'convocatoria') {
      const t = setTimeout(() => advancePhase(), duration);
      return () => clearTimeout(t);
    }

    if (council.phase === 'posicion') {
      const posicionScripts = DEMO_COUNCIL_SCRIPTS.filter((s) => s.phase === 'posicion');
      let idx = 0;
      const showNext = () => {
        if (idx >= posicionScripts.length) {
          advancePhase();
          return;
        }
        const script = posicionScripts[idx];
        setCurrentSpeech({ sphereId: script.sphereId, text: script.text, phase: 'posicion' });
        setCouncil((prev) => ({
          ...prev,
          positions: { ...prev.positions, [script.sphereId]: script.text },
        }));
        idx++;
        setTimeout(showNext, PHASE_DURATIONS.posicion);
      };
      showNext();
      return;
    }

    if (council.phase === 'replica') {
      const replicaScripts = DEMO_COUNCIL_SCRIPTS.filter((s) => s.phase === 'replica');
      let idx = 0;
      const showNext = () => {
        if (idx >= replicaScripts.length) {
          advancePhase();
          return;
        }
        const script = replicaScripts[idx];
        setCurrentSpeech({ sphereId: script.sphereId, text: script.text, phase: 'replica' });
        idx++;
        setTimeout(showNext, PHASE_DURATIONS.replica);
      };
      showNext();
      return;
    }

    if (council.phase === 'sintesis') {
      const synthText = 'DECISIÓN: Investigación paralela + diseño de plantilla base simultáneos. '
        + 'Research-Esfera comparte datos en tiempo real con Darya. '
        + 'Outreach simultáneo al finalizar investigación. '
        + 'Tiempo estimado: 28 horas. Costo proyectado: $6.40.';
      setSynthesis(synthText);
      setCurrentSpeech(null);
      soundSystem.playEvent('synthesis_reached');
      const t = setTimeout(() => advancePhase(), PHASE_DURATIONS.sintesis);
      return () => clearTimeout(t);
    }

    if (council.phase === 'retorno') {
      soundSystem.playEvent('task_complete');
      const t = setTimeout(() => {
        endCouncil();
        // Mark sphere statuses back
        DEFAULT_COUNCIL_MEMBERS.forEach((id) => setSphereStatus(id, 'activa'));
        transitionToKanban();
      }, PHASE_DURATIONS.retorno);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [council.phase, state.councilActive]);

  if (!state.councilActive) return null;

  return (
    <div className="council-overlay">
      {/* Phase indicator */}
      {council.phase !== 'idle' && (
        <div className="council-phase-indicator">
          <span className="phase-label">{PHASE_LABELS[council.phase]}</span>
          <div className="council-participants">
            {council.participants.map((id) => (
              <div
                key={id}
                className="council-participant-dot"
                style={{
                  backgroundColor: SPHERE_IDENTITIES[id].color,
                  boxShadow: council.phase === 'sintesis'
                    ? `0 0 12px ${SPHERE_IDENTITIES[id].color}`
                    : 'none',
                }}
                title={SPHERE_IDENTITIES[id].nombre}
              />
            ))}
          </div>
        </div>
      )}

      {/* Model panel (shown during posicion/replica) */}
      {(council.phase === 'posicion' || council.phase === 'replica') && (
        <div className="council-model-panel">
          <div className="model-panel-header">MODELOS EN CONSEJO</div>
          <div className="model-entries">
            <div className="model-entry">
              <span className="model-role">POSICIÓN</span>
              <span className="model-name">por dominio</span>
            </div>
            <div className="model-entry">
              <span className="model-role">RÉPLICA</span>
              <span className="model-name">{panel.replica_model}</span>
            </div>
            <div className="model-entry">
              <span className="model-role">SÍNTESIS</span>
              <span className="model-name">{panel.sintesis_model}</span>
            </div>
          </div>
        </div>
      )}

      {/* Speech bubble */}
      {currentSpeech && (
        <SpeechBubble
          sphereId={currentSpeech.sphereId}
          text={currentSpeech.text}
          phase={currentSpeech.phase}
        />
      )}

      {/* Synthesis */}
      {synthesis && council.phase === 'sintesis' && (
        <SynthesisDisplay text={synthesis} />
      )}

      {/* Manual close */}
      <button
        className="btn-close-council"
        onClick={() => {
          endCouncil();
          transitionToKanban();
        }}
      >
        CERRAR CONSEJO
      </button>
    </div>
  );
}
