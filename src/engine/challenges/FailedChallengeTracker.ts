import type { Challenge } from '../../challenges/types.ts';
import type { FailedChallengeRecord } from '../../persistence/types.ts';

export class FailedChallengeTracker {
  private records: Map<string, FailedChallengeRecord> = new Map();
  public retryChance: number;
  public correctToRemove: number;

  constructor(retryChance = 0.2, correctToRemove = 3) {
    this.retryChance = retryChance;
    this.correctToRemove = correctToRemove;
  }

  private key(challenge: Challenge): string {
    return `${challenge.display}::${challenge.answer}`;
  }

  recordFailure(challenge: Challenge, difficulty: number): void {
    const k = this.key(challenge);
    const existing = this.records.get(k);
    if (existing) {
      existing.failCount++;
      existing.consecutiveCorrect = 0;
    } else {
      this.records.set(k, {
        challenge,
        providerDifficulty: difficulty,
        failCount: 1,
        consecutiveCorrect: 0,
      });
    }
  }

  recordSuccess(challenge: Challenge): void {
    const k = this.key(challenge);
    const existing = this.records.get(k);
    if (!existing) return;

    existing.consecutiveCorrect++;
    if (existing.consecutiveCorrect >= this.correctToRemove) {
      this.records.delete(k);
    }
  }

  shouldRetry(): boolean {
    if (this.records.size === 0) return false;
    return Math.random() < this.retryChance;
  }

  getRetryChallenge(): Challenge | null {
    if (this.records.size === 0) return null;

    const entries = Array.from(this.records.values());
    const totalWeight = entries.reduce((sum, r) => sum + r.failCount, 0);
    let roll = Math.random() * totalWeight;

    for (const record of entries) {
      roll -= record.failCount;
      if (roll <= 0) {
        return record.challenge;
      }
    }

    return entries[entries.length - 1].challenge;
  }

  getFailedDisplays(): Set<string> {
    const displays = new Set<string>();
    for (const record of this.records.values()) {
      displays.add(record.challenge.display);
    }
    return displays;
  }

  getAll(): FailedChallengeRecord[] {
    return Array.from(this.records.values());
  }

  loadFrom(records: FailedChallengeRecord[]): void {
    this.records.clear();
    for (const r of records) {
      this.records.set(this.key(r.challenge), { ...r });
    }
  }
}
