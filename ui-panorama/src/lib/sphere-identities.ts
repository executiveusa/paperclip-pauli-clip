import type { SphereId, SphereStatus } from './types';

// ═══ SPHERE IDENTITY SYSTEM ═══

export interface SphereIdentity {
  nombre: string;
  rol: string;
  color: string;
  colorName: string;
  size: number;
  tone: string;
  tablePosition: number;
  tescito: string;
  reporta_a: SphereId | null;
}

export const SPHERE_IDENTITIES: Record<SphereId, SphereIdentity> = {
  'synthia-prime': {
    nombre: 'SYNTHIA™ Prime',
    rol: 'Directora — Head Chef',
    color: '#c8a04a',
    colorName: 'Oro',
    size: 1.0,
    tone: 'C4',
    tablePosition: 0,
    tescito: '#d4af60',
    reporta_a: null,
  },
  'darya-design': {
    nombre: 'Darya — Diseño',
    rol: 'Awwwards-Level Frontend',
    color: '#8a4a7a',
    colorName: 'Malva',
    size: 0.88,
    tone: 'E4',
    tablePosition: 1,
    tescito: '#9a5a8a',
    reporta_a: 'synthia-prime',
  },
  'research-esfera': {
    nombre: 'Investigadora',
    rol: 'Research + Data + Scraping',
    color: '#4a6a8a',
    colorName: 'Acero',
    size: 0.82,
    tone: 'G4',
    tablePosition: 2,
    tescito: '#5a7a9a',
    reporta_a: 'synthia-prime',
  },
  'deploy-esfera': {
    nombre: 'Desplegadora',
    rol: 'Vercel + Cloudflare + CI/CD',
    color: '#4a8a5a',
    colorName: 'Bosque',
    size: 0.78,
    tone: 'A4',
    tablePosition: 3,
    tescito: '#5a9a6a',
    reporta_a: 'synthia-prime',
  },
  'outreach-esfera': {
    nombre: 'Embajadora',
    rol: 'WhatsApp + Email + Outreach',
    color: '#8a6a4a',
    colorName: 'Ámbar',
    size: 0.75,
    tone: 'B4',
    tablePosition: 4,
    tescito: '#9a7a5a',
    reporta_a: 'synthia-prime',
  },
  'build-esfera': {
    nombre: 'Constructora',
    rol: 'Site Factory + Code Generation',
    color: '#5a4a8a',
    colorName: 'Índigo',
    size: 0.75,
    tone: 'D4',
    tablePosition: 5,
    tescito: '#6a5a9a',
    reporta_a: 'synthia-prime',
  },
};

// ═══ STATUS → VISUAL MAPPING ═══

export interface StatusVisual {
  pulse: 'slow' | 'medium' | 'very_slow' | 'erratic' | 'synchronized' | 'celebration';
  opacity: number;
  haloOpacity: number;
  tescitoSwirl: boolean;
  tescitoColorOverride?: string;
  label: string;
}

export const STATUS_VISUALS: Record<SphereStatus, StatusVisual> = {
  activa: {
    pulse: 'slow',
    opacity: 1.0,
    haloOpacity: 0.25,
    tescitoSwirl: false,
    label: 'ACTIVA',
  },
  trabajando: {
    pulse: 'medium',
    opacity: 1.0,
    haloOpacity: 0.4,
    tescitoSwirl: true,
    label: 'TRABAJANDO',
  },
  descansando: {
    pulse: 'very_slow',
    opacity: 0.6,
    haloOpacity: 0.1,
    tescitoSwirl: false,
    label: 'DESCANSANDO',
  },
  bloqueada: {
    pulse: 'erratic',
    opacity: 0.8,
    haloOpacity: 0.15,
    tescitoSwirl: false,
    label: 'BLOQUEADA',
  },
  en_consejo: {
    pulse: 'synchronized',
    opacity: 1.0,
    haloOpacity: 0.6,
    tescitoSwirl: true,
    tescitoColorOverride: '#ffd060',
    label: 'EN CONSEJO',
  },
  completado: {
    pulse: 'celebration',
    opacity: 1.0,
    haloOpacity: 0.5,
    tescitoSwirl: false,
    label: 'COMPLETADO',
  },
};

// ═══ SPHERE TABLE POSITIONS (6 tables around a center) ═══
// Arranged in a half-circle facing the bay view

export const TABLE_POSITIONS: Record<number, { x: number; z: number }> = {
  0: { x: 0, z: 0 },       // Synthia Prime — center, near bay
  1: { x: -3.5, z: 1.5 },  // Darya
  2: { x: -2.2, z: 3.8 },  // Research
  3: { x: 0, z: 4.5 },     // Deploy
  4: { x: 2.2, z: 3.8 },   // Outreach
  5: { x: 3.5, z: 1.5 },   // Build
};

// Utility: lighten a hex color by factor (0–1)
export function lightenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * factor));
  const lg = Math.min(255, Math.round(g + (255 - g) * factor));
  const lb = Math.min(255, Math.round(b + (255 - b) * factor));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

// Utility: hex to THREE.js-compatible number
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
