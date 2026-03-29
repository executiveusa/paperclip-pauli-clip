// ═══ SOUND SYSTEM ═══
// Manages ambient piano + event tones for El Panorama

import { SCENE_CONFIG } from './scene-config';

type AudioEvent = keyof typeof SCENE_CONFIG.audio.events;

class SoundSystem {
  private ambientAudio: HTMLAudioElement | null = null;
  private enabled: boolean = false;
  private eventAudios: Map<string, HTMLAudioElement> = new Map();

  init(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.initAmbient();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.initAmbient();
    } else {
      this.ambientAudio?.pause();
    }
  }

  private initAmbient() {
    if (this.ambientAudio) return;
    this.ambientAudio = new Audio(SCENE_CONFIG.audio.ambient);
    this.ambientAudio.loop = true;
    this.ambientAudio.volume = SCENE_CONFIG.audio.baseVolume;
    // Attempt play — browsers may block without interaction
    this.ambientAudio.play().catch(() => {
      // User hasn't interacted yet — will try again on first interaction
    });
  }

  playEvent(event: AudioEvent) {
    if (!this.enabled) return;
    const cfg = SCENE_CONFIG.audio.events[event];
    const audio = new Audio(cfg.file);
    audio.volume = cfg.volume;
    audio.play().catch(() => {});
  }

  setCouncilMode(active: boolean) {
    if (!this.ambientAudio) return;
    const targetVolume = active
      ? SCENE_CONFIG.audio.councilVolume
      : SCENE_CONFIG.audio.baseVolume;
    this.fadeVolume(this.ambientAudio, targetVolume, 1500);
  }

  private fadeVolume(audio: HTMLAudioElement, target: number, duration: number) {
    const start = audio.volume;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      audio.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  tryUnlockAudio() {
    if (this.enabled && this.ambientAudio && this.ambientAudio.paused) {
      this.ambientAudio.play().catch(() => {});
    }
  }

  destroy() {
    this.ambientAudio?.pause();
    this.ambientAudio = null;
  }
}

// Singleton
export const soundSystem = new SoundSystem();
