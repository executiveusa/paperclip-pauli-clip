import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { AppState, AppAction, SphereId, SphereStatus, KanbanColumn, SubAgentInfo } from '@/lib/types';
import { INITIAL_APP_STATE } from '@/lib/mock-data';

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SOUND_MODE':
      return { ...state, soundMode: action.payload };
    case 'SET_TRANSITION':
      return { ...state, transitionState: action.payload };
    case 'SET_DEMO_MODE':
      return { ...state, demoMode: action.payload };
    case 'START_COUNCIL':
      return {
        ...state,
        councilActive: true,
        activeCouncilMisionId: action.payload.misionId,
        sphereStatuses: Object.fromEntries(
          Object.entries(state.sphereStatuses).map(([k, v]) => [
            k,
            ['synthia-prime', 'research-esfera', 'darya-design', 'deploy-esfera', 'build-esfera'].includes(k)
              ? 'en_consejo'
              : v,
          ])
        ) as AppState['sphereStatuses'],
      };
    case 'END_COUNCIL':
      return {
        ...state,
        councilActive: false,
        activeCouncilMisionId: undefined,
        sphereStatuses: Object.fromEntries(
          Object.entries(state.sphereStatuses).map(([k, v]) => [
            k,
            v === 'en_consejo' ? 'activa' : v,
          ])
        ) as AppState['sphereStatuses'],
      };
    case 'SET_SPHERE_STATUS':
      return {
        ...state,
        sphereStatuses: {
          ...state.sphereStatuses,
          [action.payload.sphereId]: action.payload.status,
        },
      };
    case 'SPAWN_SUB_AGENT':
      return { ...state, subAgents: [...state.subAgents, action.payload] };
    case 'DISSOLVE_SUB_AGENT':
      return {
        ...state,
        subAgents: state.subAgents.map((sa) =>
          sa.id === action.payload.id ? { ...sa, status: 'dissolving' as const } : sa
        ),
      };
    case 'REMOVE_SUB_AGENT':
      return {
        ...state,
        subAgents: state.subAgents.filter((sa) => sa.id !== action.payload.id),
      };
    case 'UPDATE_MISION':
      return {
        ...state,
        activeMisions: state.activeMisions.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };
    case 'MOVE_MISION':
      return {
        ...state,
        activeMisions: state.activeMisions.map((m) =>
          m.id === action.payload.id ? { ...m, columna: action.payload.columna } : m
        ),
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience helpers
  setSphereStatus: (sphereId: SphereId, status: SphereStatus) => void;
  transitionToPanorama: () => void;
  transitionToKanban: () => void;
  startCouncil: (misionId: string) => void;
  endCouncil: () => void;
  moveMision: (id: string, columna: KanbanColumn) => void;
  spawnSubAgent: (info: SubAgentInfo) => void;
  dissolveSubAgent: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_APP_STATE);

  const setSphereStatus = useCallback(
    (sphereId: SphereId, status: SphereStatus) =>
      dispatch({ type: 'SET_SPHERE_STATUS', payload: { sphereId, status } }),
    []
  );

  const transitionToPanorama = useCallback(() => {
    dispatch({ type: 'SET_TRANSITION', payload: 'to-panorama' });
    setTimeout(() => {
      dispatch({ type: 'SET_VIEW_MODE', payload: 'panorama' });
      dispatch({ type: 'SET_TRANSITION', payload: 'idle' });
    }, 800);
  }, []);

  const transitionToKanban = useCallback(() => {
    dispatch({ type: 'SET_TRANSITION', payload: 'to-kanban' });
    setTimeout(() => {
      dispatch({ type: 'SET_VIEW_MODE', payload: 'kanban' });
      dispatch({ type: 'SET_TRANSITION', payload: 'idle' });
    }, 800);
  }, []);

  const startCouncil = useCallback(
    (misionId: string) => dispatch({ type: 'START_COUNCIL', payload: { misionId } }),
    []
  );

  const endCouncil = useCallback(() => dispatch({ type: 'END_COUNCIL' }), []);

  const moveMision = useCallback(
    (id: string, columna: KanbanColumn) =>
      dispatch({ type: 'MOVE_MISION', payload: { id, columna } }),
    []
  );

  const spawnSubAgent = useCallback(
    (info: SubAgentInfo) => dispatch({ type: 'SPAWN_SUB_AGENT', payload: info }),
    []
  );

  const dissolveSubAgent = useCallback(
    (id: string) => dispatch({ type: 'DISSOLVE_SUB_AGENT', payload: { id } }),
    []
  );

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setSphereStatus,
        transitionToPanorama,
        transitionToKanban,
        startCouncil,
        endCouncil,
        moveMision,
        spawnSubAgent,
        dissolveSubAgent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
