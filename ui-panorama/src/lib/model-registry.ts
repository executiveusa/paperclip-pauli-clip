// ═══ OPEN SOURCE MODEL REGISTRY ═══
// Route to the best available model for each domain

export interface ModelEntry {
  model: string;
  provider: string;
  tier: 1 | 2 | 3;
  open_source?: boolean;
  specialty?: string;
  multilingual?: boolean;
}

export const MODEL_REGISTRY = {
  strategy: [
    { model: 'claude-opus-4-6', provider: 'anthropic', tier: 1 as const },
    { model: 'gpt-4o', provider: 'openai', tier: 1 as const },
    { model: 'gemini-2.0-pro', provider: 'google', tier: 1 as const },
  ],
  code: [
    { model: 'claude-sonnet-4-6', provider: 'anthropic', tier: 1 as const },
    { model: 'deepseek-coder-v2', provider: 'deepseek', tier: 1 as const, open_source: true },
    { model: 'codestral-latest', provider: 'mistral', tier: 2 as const, open_source: true },
    { model: 'qwen2.5-coder-32b', provider: 'qwen', tier: 2 as const, open_source: true },
  ],
  spanish_nlp: [
    { model: 'claude-sonnet-4-6', provider: 'anthropic', tier: 1 as const },
    { model: 'mistral-large', provider: 'mistral', tier: 1 as const },
    { model: 'salamandra-7b', provider: 'bsc', tier: 2 as const, open_source: true, specialty: 'Spanish' },
    { model: 'aya-35b', provider: 'cohere', tier: 2 as const, open_source: true, specialty: 'Multilingual' },
  ],
  design_judgment: [
    { model: 'claude-opus-4-6', provider: 'anthropic', tier: 1 as const },
    { model: 'gpt-4o', provider: 'openai', tier: 1 as const },
  ],
  research: [
    { model: 'perplexity-sonar-pro', provider: 'perplexity', tier: 1 as const },
    { model: 'claude-sonnet-4-6', provider: 'anthropic', tier: 1 as const },
    { model: 'llama-3.3-70b', provider: 'meta', tier: 2 as const, open_source: true },
  ],
  minion: [
    { model: 'claude-haiku-4-5', provider: 'anthropic', tier: 3 as const },
    { model: 'gemini-flash-2.0', provider: 'google', tier: 3 as const },
    { model: 'llama-3.2-3b', provider: 'meta', tier: 3 as const, open_source: true },
    { model: 'phi-4-mini', provider: 'microsoft', tier: 3 as const, open_source: true },
    { model: 'qwen2.5-1.5b', provider: 'qwen', tier: 3 as const, open_source: true },
  ],
  embeddings: [
    { model: 'text-embedding-3-large', provider: 'openai', tier: 1 as const },
    { model: 'nomic-embed-text', provider: 'nomic', tier: 2 as const, open_source: true },
    { model: 'bge-m3', provider: 'baai', tier: 2 as const, open_source: true, multilingual: true },
  ],
  voice_transcription: [
    { model: 'whisper-large-v3', provider: 'openai', tier: 1 as const, open_source: true },
    { model: 'distil-whisper-large-v3', provider: 'huggingface', tier: 2 as const, open_source: true },
  ],
  voice_synthesis: [
    { model: 'eleven-multilingual-v3', provider: 'elevenlabs', tier: 1 as const },
    { model: 'coqui-xtts-v2', provider: 'coqui', tier: 2 as const, open_source: true },
  ],
  vision: [
    { model: 'claude-opus-4-6', provider: 'anthropic', tier: 1 as const },
    { model: 'gpt-4o', provider: 'openai', tier: 1 as const },
    { model: 'llava-next-34b', provider: 'llava', tier: 2 as const, open_source: true },
    { model: 'qwen2.5-vl-72b', provider: 'qwen', tier: 2 as const, open_source: true },
  ],
} as const;

export type ModelDomain = keyof typeof MODEL_REGISTRY;

// Sphere → domain mapping
import type { SphereId } from './types';

export const SPHERE_DOMAIN_MODELS: Record<SphereId, ModelDomain> = {
  'synthia-prime': 'strategy',
  'darya-design': 'design_judgment',
  'research-esfera': 'research',
  'deploy-esfera': 'code',
  'outreach-esfera': 'spanish_nlp',
  'build-esfera': 'code',
};

// Council triggers
export const COUNCIL_TRIGGERS = {
  minCost: 5,           // $5 estimated cost
  minMesasAffected: 2,
  keywords: ['consejo', 'council', 'conflicto'],
  irreversibility: true,
} as const;

// Select best available model (returns first tier-1 entry)
export function selectBestModel(domain: ModelDomain): string {
  const models = MODEL_REGISTRY[domain] as ModelEntry[];
  const tier1 = models.filter((m) => m.tier === 1);
  return (tier1[0] ?? models[0]).model;
}
