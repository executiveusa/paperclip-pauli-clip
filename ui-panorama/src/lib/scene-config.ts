// ═══ THREE.JS SCENE CONFIGURATION ═══
// El Panorama Rooftop — Puerto Vallarta

export const SCENE_CONFIG = {
  environment: {
    backgroundColor: '#020408',
    fogColor: '#0a0f18',
    fogNear: 60,
    fogFar: 280,
    ambientLight: { color: '#c8904a', intensity: 0.12 },
    starField: {
      count: 2000,
      size: 0.4,
      opacity: 0.7,
      depth: 200,
    },
  },

  bay: {
    waterColor: '#030c1a',
    reflections: true,
    cityLights: {
      color: '#e8c870',
      intensity: 0.35,
    },
    horizon: {
      glow: '#1a0f05',
      intensity: 0.2,
    },
  },

  restaurant: {
    tables: 6,
    tableRadius: 0.5,
    tableLinen: '#f5f0e8',
    candleGlow: { color: '#f0a050', intensity: 0.8, flicker: true },
  },

  spheres: {
    baseRadius: 0.38,
    floatHeight: 1.15,
    pulseAmplitude: 0.04,
    pulseSpeed: 0.85,
    innerGlow: { opacity: 0.9, brightness: 1.4 },
    outerHalo: { opacity: 0.25, scale: 1.6 },
    tescito: {
      liquidGlow: true,
      liquidOpacity: 0.75,
      swirlSpeed: 0.4,
      steamParticles: true,
    },
    subSphere: {
      radiusFactor: 0.47,
      opacity: 0.85,
      trail: true,
    },
  },

  arcs: {
    color: '#c8a04a',
    opacity: 0.4,
    thickness: 0.02,
    arcHeight: 2.0,
    particleCount: 10,
    particleSpeed: 0.8,
  },

  council: {
    gatherPosition: { x: 0, y: 2.0, z: 0 },
    formationRadius: 2.5,
    arcColor: '#ffd060',
    arcOpacity: 0.65,
    cameraZoom: 0.72,
    decisionBeam: {
      color: '#ffffff',
      opacity: 0.6,
      duration: 3000,
    },
  },

  camera: {
    defaultPosition: { x: 0, y: 9, z: 16 },
    defaultTarget: { x: 0, y: 2, z: 0 },
    orbitSpeed: 0.035,
    fov: 58,
    transitionDuration: 1200,
  },

  audio: {
    ambient: '/audio/piano-ambient-pv.mp3',
    baseVolume: 0.12,
    councilVolume: 0.22,
    events: {
      sphere_activate:   { file: '/audio/tone_warm.mp3', volume: 0.3 },
      task_complete:     { file: '/audio/chord_resolution.mp3', volume: 0.5 },
      council_start:     { file: '/audio/gong_soft.mp3', volume: 0.4 },
      synthesis_reached: { file: '/audio/chord_major.mp3', volume: 0.6 },
      sub_dissolve:      { file: '/audio/shimmer_fade.mp3', volume: 0.4 },
    },
  },
} as const;

export type SceneConfig = typeof SCENE_CONFIG;
