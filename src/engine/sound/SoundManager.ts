import type { SoundEntry } from '../types.ts';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private volumes: Map<string, number> = new Map();
  private activeLoops: Map<string, { source: AudioBufferSourceNode; gain: GainNode }> = new Map();
  private userInteracted = false;
  private enabled = true;
  private masterVolume = 1.0;

  async loadAll(manifest: Record<string, SoundEntry>): Promise<void> {
    this.ctx = new AudioContext();
    const entries = Object.entries(manifest);

    await Promise.all(
      entries.map(async ([key, entry]) => {
        try {
          const response = await fetch(entry.path);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
          this.buffers.set(key, audioBuffer);
          this.volumes.set(key, entry.volume);
        } catch {
          console.warn(`Failed to load sound: ${key} (${entry.path})`);
        }
      }),
    );
  }

  play(soundId: string): void {
    if (!this.enabled || !this.userInteracted || !this.ctx) return;

    const buffer = this.buffers.get(soundId);
    if (!buffer) return;

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = (this.volumes.get(soundId) ?? 1.0) * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    source.start(0);
  }

  playLoop(soundId: string, key: string): void {
    if (!this.enabled || !this.userInteracted || !this.ctx) return;

    // Stop existing loop with this key
    this.stopLoop(key);

    const buffer = this.buffers.get(soundId);
    if (!buffer) return;

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = (this.volumes.get(soundId) ?? 1.0) * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    source.start(0);

    this.activeLoops.set(key, { source, gain: gainNode });
  }

  stopLoop(key: string): void {
    const loop = this.activeLoops.get(key);
    if (loop) {
      try {
        loop.source.stop();
      } catch {
        // Already stopped
      }
      this.activeLoops.delete(key);
    }
  }

  markUserInteracted(): void {
    this.userInteracted = true;
    if (this.ctx?.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  destroy(): void {
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
