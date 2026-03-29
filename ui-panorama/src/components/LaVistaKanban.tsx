import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SPHERE_IDENTITIES, STATUS_VISUALS } from '@/lib/sphere-identities';
import type { KanbanColumn, Mision, SphereId } from '@/lib/types';

// ═══ COLUMN CONFIG ═══

const COLUMNS: { id: KanbanColumn; label: string; icon: string; hidden?: boolean }[] = [
  { id: 'bandeja', label: 'BANDEJA', icon: '📥' },
  { id: 'proximo', label: 'PRÓXIMO', icon: '⚡' },
  { id: 'en_ronda', label: 'EN RONDA', icon: '🔄' },
  { id: 'esperando', label: 'ESPERANDO', icon: '⏳' },
  { id: 'listo', label: 'LISTO', icon: '✅' },
  { id: 'algun_dia', label: 'ALGÚN DÍA', icon: '🌙', hidden: true },
];

const PRIORIDAD_COLORS: Record<string, string> = {
  critica: '#ff4444',
  alta: '#c8a04a',
  media: '#4a6a8a',
  baja: '#4a5a4a',
};

// ═══ SPHERE STRIP (top of board) ═══

function SphereStrip({ filterSphere, onFilterChange }: {
  filterSphere: SphereId | null;
  onFilterChange: (id: SphereId | null) => void;
}) {
  const { state } = useApp();
  const sphereIds = Object.keys(SPHERE_IDENTITIES) as SphereId[];

  return (
    <div className="sphere-strip">
      {sphereIds.map((id) => {
        const identity = SPHERE_IDENTITIES[id];
        const status = state.sphereStatuses[id];
        const visual = STATUS_VISUALS[status];
        const misionCount = state.activeMisions.filter((m) => m.esferas.includes(id)).length;
        const isActive = filterSphere === id;

        return (
          <button
            key={id}
            className={`sphere-strip-item ${isActive ? 'active' : ''}`}
            onClick={() => onFilterChange(isActive ? null : id)}
            title={`${identity.nombre} — ${identity.rol}`}
          >
            <div
              className="sphere-dot"
              style={{
                backgroundColor: identity.color,
                opacity: visual.opacity,
                boxShadow: `0 0 8px ${identity.color}80, 0 0 16px ${identity.color}40`,
              }}
            />
            <span className="sphere-strip-name">{identity.nombre.split(' ')[0]}</span>
            <span className="sphere-strip-status">{visual.label}</span>
            <span className="sphere-strip-count">{misionCount}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══ MISSION CARD ═══

function MisionCard({ mision, onCouncil }: {
  mision: Mision;
  onCouncil: (id: string) => void;
}) {
  const { moveMision } = useApp();
  const [expanded, setExpanded] = useState(false);
  const primarySphere = mision.esferas[0];
  const identity = primarySphere ? SPHERE_IDENTITIES[primarySphere] : null;
  const needsCouncil = mision.tags?.includes('council-needed') || (mision.councilHistory !== undefined && mision.councilHistory.length === 0);

  return (
    <div
      className={`mision-card prioridad-${mision.prioridad}`}
      style={identity ? { '--sphere-color': identity.color } as React.CSSProperties : {}}
    >
      {/* Priority stripe */}
      <div
        className="prioridad-stripe"
        style={{ backgroundColor: PRIORIDAD_COLORS[mision.prioridad] }}
      />

      {/* Card header */}
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <div className="card-spheres">
          {mision.esferas.map((sphereId) => (
            <div
              key={sphereId}
              className="card-sphere-dot"
              style={{ backgroundColor: SPHERE_IDENTITIES[sphereId].color }}
              title={SPHERE_IDENTITIES[sphereId].nombre}
            />
          ))}
          {mision.subAgentCount > 0 && (
            <div className="sub-agent-count" title={`${mision.subAgentCount} sub-agents`}>
              +{mision.subAgentCount}
            </div>
          )}
        </div>
        <h3 className="card-title">{mision.titulo}</h3>
        {mision.tokenCost > 0 && (
          <span className="card-cost">${mision.tokenCost.toFixed(2)}</span>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="card-detail">
          {mision.descripcion && (
            <p className="card-description">{mision.descripcion}</p>
          )}
          {mision.proximoPaso && (
            <div className="card-next-action">
              <span className="label">PRÓXIMO PASO</span>
              <span>{mision.proximoPaso}</span>
            </div>
          )}
          {mision.udecScore !== undefined && (
            <div className="card-udec">
              <span className="label">UDEC</span>
              <span className={mision.udecScore >= 9 ? 'score-high' : mision.udecScore >= 7 ? 'score-mid' : 'score-low'}>
                {mision.udecScore.toFixed(1)}
              </span>
            </div>
          )}
          <div className="card-tags">
            {mision.tags?.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          {/* Move to column controls */}
          <div className="card-actions">
            {COLUMNS.filter((c) => !c.hidden && c.id !== mision.columna).map((col) => (
              <button
                key={col.id}
                className="btn-move"
                onClick={(e) => { e.stopPropagation(); moveMision(mision.id, col.id); }}
              >
                → {col.label}
              </button>
            ))}
            {needsCouncil && (
              <button
                className="btn-council"
                onClick={(e) => { e.stopPropagation(); onCouncil(mision.id); }}
              >
                ⚡ CONSEJO
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ KANBAN COLUMN ═══

function KanbanColumnView({ column, missions, filterSphere, onCouncil }: {
  column: typeof COLUMNS[0];
  missions: Mision[];
  filterSphere: SphereId | null;
  onCouncil: (id: string) => void;
}) {
  const filtered = filterSphere
    ? missions.filter((m) => m.esferas.includes(filterSphere))
    : missions;

  return (
    <div className="kanban-column">
      <div className="column-header">
        <span className="column-icon">{column.icon}</span>
        <span className="column-label">{column.label}</span>
        <span className="column-count">{filtered.length}</span>
      </div>
      <div className="column-cards">
        {filtered.map((m) => (
          <MisionCard key={m.id} mision={m} onCouncil={onCouncil} />
        ))}
        {filtered.length === 0 && (
          <div className="column-empty">—</div>
        )}
      </div>
    </div>
  );
}

// ═══ LA VISTA KANBAN (Main Board) ═══

export function LaVistaKanban() {
  const { state, transitionToPanorama, startCouncil } = useApp();
  const [filterSphere, setFilterSphere] = useState<SphereId | null>(null);
  const [showAlgunDia, setShowAlgunDia] = useState(false);

  const visibleColumns = showAlgunDia
    ? COLUMNS
    : COLUMNS.filter((c) => !c.hidden);

  const handleCouncil = (misionId: string) => {
    startCouncil(misionId);
    transitionToPanorama();
  };

  return (
    <div className="la-vista-root">
      {/* Header */}
      <header className="la-vista-header">
        <div className="header-brand">
          <span className="brand-text">PAULI-CLIP™</span>
          <span className="brand-sub">La Vista</span>
        </div>
        <div className="header-controls">
          {state.councilActive && (
            <div className="council-banner">
              <span>⚡ CONSEJO EN PROGRESO</span>
              <button className="btn-ver-3d" onClick={transitionToPanorama}>
                VER EN 3D
              </button>
            </div>
          )}
          <button
            className="btn-panorama"
            onClick={transitionToPanorama}
            title="Abrir El Panorama 3D"
          >
            EL PANORAMA
          </button>
          <button
            className="btn-algun-dia"
            onClick={() => setShowAlgunDia(!showAlgunDia)}
          >
            {showAlgunDia ? 'OCULTAR ALGÚN DÍA' : 'ALGÚN DÍA'}
          </button>
        </div>
      </header>

      {/* Sphere Strip */}
      <SphereStrip filterSphere={filterSphere} onFilterChange={setFilterSphere} />

      {/* Kanban Board */}
      <div className="kanban-board">
        {visibleColumns.map((col) => (
          <KanbanColumnView
            key={col.id}
            column={col}
            missions={state.activeMisions.filter((m) => m.columna === col.id)}
            filterSphere={filterSphere}
            onCouncil={handleCouncil}
          />
        ))}
      </div>
    </div>
  );
}
