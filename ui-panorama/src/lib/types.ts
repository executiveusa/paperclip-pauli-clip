// ═══ PAULI-CLIP™ CORE TYPES ═══

export type SphereId =
  | 'synthia-prime'
  | 'darya-design'
  | 'research-esfera'
  | 'deploy-esfera'
  | 'outreach-esfera'
  | 'build-esfera';

export type SphereStatus =
  | 'activa'
  | 'trabajando'
  | 'descansando'
  | 'bloqueada'
  | 'en_consejo'
  | 'completado';

export type MisionPrioridad = 'critica' | 'alta' | 'media' | 'baja';

export type KanbanColumn =
  | 'bandeja'
  | 'proximo'
  | 'en_ronda'
  | 'esperando'
  | 'listo'
  | 'algun_dia';

export interface Mision {
  id: string;
  titulo: string;
  descripcion?: string;
  columna: KanbanColumn;
  prioridad: MisionPrioridad;
  esferas: SphereId[];
  subAgentCount: number;
  tokenCost: number;
  udecScore?: number;
  councilHistory?: CouncilRecord[];
  tags?: string[];
  proximoPaso?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubAgentInfo {
  id: string;
  parentId: SphereId;
  taskLabel: string;
  status: 'working' | 'returning' | 'dissolving' | 'dissolved';
  position: { x: number; y: number; z: number };
}

export interface CouncilRecord {
  id: string;
  misionId: string;
  startedAt: string;
  endedAt?: string;
  positions: Record<SphereId, string>;
  rebuttals: Record<SphereId, string>;
  synthesis: string;
  modelsUsed: Record<string, string>;
}

export interface AppState {
  sphereStatuses: Record<SphereId, SphereStatus>;
  activeMisions: Mision[];
  subAgents: SubAgentInfo[];
  councilActive: boolean;
  activeCouncilMisionId?: string;
  viewMode: 'kanban' | 'panorama';
  soundMode: 'sound' | 'silent';
  demoMode: boolean;
  transitionState: 'idle' | 'to-panorama' | 'to-kanban';
}

export type AppAction =
  | { type: 'SET_VIEW_MODE'; payload: 'kanban' | 'panorama' }
  | { type: 'SET_SOUND_MODE'; payload: 'sound' | 'silent' }
  | { type: 'START_COUNCIL'; payload: { misionId: string } }
  | { type: 'END_COUNCIL' }
  | { type: 'SET_SPHERE_STATUS'; payload: { sphereId: SphereId; status: SphereStatus } }
  | { type: 'SPAWN_SUB_AGENT'; payload: SubAgentInfo }
  | { type: 'DISSOLVE_SUB_AGENT'; payload: { id: string } }
  | { type: 'REMOVE_SUB_AGENT'; payload: { id: string } }
  | { type: 'UPDATE_MISION'; payload: Partial<Mision> & { id: string } }
  | { type: 'MOVE_MISION'; payload: { id: string; columna: KanbanColumn } }
  | { type: 'SET_TRANSITION'; payload: AppState['transitionState'] }
  | { type: 'SET_DEMO_MODE'; payload: boolean };
