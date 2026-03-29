// ═══ LLM COUNCIL PROTOCOL ═══
// Karpathy-style: Position → Rebuttal → Synthesis

import type { SphereId } from './types';
import { SPHERE_DOMAIN_MODELS, MODEL_REGISTRY, selectBestModel } from './model-registry';

export type CouncilPhase =
  | 'idle'
  | 'convocatoria'  // Summons — spheres gather
  | 'posicion'      // Round 1: Position
  | 'replica'       // Round 2: Rebuttal
  | 'sintesis'      // Round 3: Synthesis
  | 'retorno';      // Return to tables

export interface CouncilState {
  phase: CouncilPhase;
  misionId?: string;
  participants: SphereId[];
  positions: Partial<Record<SphereId, string>>;
  rebuttals: Partial<Record<SphereId, string>>;
  synthesis?: string;
  activeSpeaker?: SphereId;
  phaseDuration: number;   // ms for current phase
  phaseStartedAt?: number; // timestamp
}

export const PHASE_DURATIONS: Record<CouncilPhase, number> = {
  idle: 0,
  convocatoria: 3000,
  posicion: 2000,    // per sphere, multiplied by participant count
  replica: 2000,
  sintesis: 4000,
  retorno: 2500,
};

export const INITIAL_COUNCIL_STATE: CouncilState = {
  phase: 'idle',
  participants: [],
  positions: {},
  rebuttals: {},
  phaseDuration: 0,
};

// Default council participants (all except the calling sphere's subs)
export const DEFAULT_COUNCIL_MEMBERS: SphereId[] = [
  'synthia-prime',
  'darya-design',
  'research-esfera',
  'deploy-esfera',
  'build-esfera',
];

// Build the council panel model config
export function buildCouncilPanel(participants: SphereId[]) {
  return {
    posicion_models: Object.fromEntries(
      participants.map((id) => [id, selectBestModel(SPHERE_DOMAIN_MODELS[id])])
    ) as Record<SphereId, string>,
    replica_model: 'claude-opus-4-6',
    sintesis_model: selectBestModel('strategy'),
    summary_model: 'claude-sonnet-4-6',
  };
}

// Mock council phases for demo / simulation
export interface CouncilScript {
  sphereId: SphereId;
  phase: 'posicion' | 'replica';
  text: string;
}

export const DEMO_COUNCIL_SCRIPTS: CouncilScript[] = [
  {
    sphereId: 'synthia-prime',
    phase: 'posicion',
    text: 'La misión requiere investigación profunda antes de cualquier outreach. Propongo comenzar con una fase de análisis de mercado de 48 horas.',
  },
  {
    sphereId: 'research-esfera',
    phase: 'posicion',
    text: 'Concuerdo. Tengo acceso a datos de restaurantes en PV. Puedo identificar los 10 objetivos óptimos en 6 horas con 3 sub-esferas.',
  },
  {
    sphereId: 'outreach-esfera',
    phase: 'posicion',
    text: 'WhatsApp tiene 95% de apertura en LATAM. Recomiendo outreach simultáneo al final del análisis, no secuencial.',
  },
  {
    sphereId: 'darya-design',
    phase: 'posicion',
    text: 'Para el sitio de cada restaurante, necesito al menos 2 horas de diseño por sitio. 10 sitios = 20 horas mínimo.',
  },
  {
    sphereId: 'synthia-prime',
    phase: 'replica',
    text: 'Modifico mi posición: investigación paralela con diseño de plantilla base. Esto reduce el total a 28 horas.',
  },
  {
    sphereId: 'research-esfera',
    phase: 'replica',
    text: 'Acepto. Compartiré datos en tiempo real con Darya para que pueda adaptar la plantilla mientras investigo.',
  },
];

// Phase progression helper
export function nextPhase(current: CouncilPhase): CouncilPhase {
  const order: CouncilPhase[] = ['idle', 'convocatoria', 'posicion', 'replica', 'sintesis', 'retorno'];
  const idx = order.indexOf(current);
  return order[Math.min(idx + 1, order.length - 1)];
}

export { SPHERE_DOMAIN_MODELS, MODEL_REGISTRY };
