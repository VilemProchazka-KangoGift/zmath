import { describe, it, expect, beforeEach } from 'vitest';
import { FailedChallengeTracker } from '../../engine/challenges/FailedChallengeTracker.ts';
import type { Challenge } from '../../challenges/types.ts';

const challenge1: Challenge = { display: '3 + 4 = ?', answer: '7', inputType: 'numeric' };
const challenge2: Challenge = { display: '5 - 2 = ?', answer: '3', inputType: 'numeric' };

describe('FailedChallengeTracker', () => {
  let tracker: FailedChallengeTracker;

  beforeEach(() => {
    tracker = new FailedChallengeTracker(0.2, 3);
  });

  it('records failures and increases failCount', () => {
    tracker.recordFailure(challenge1, 1);
    tracker.recordFailure(challenge1, 1);
    const all = tracker.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].failCount).toBe(2);
    expect(all[0].consecutiveCorrect).toBe(0);
  });

  it('shouldRetry returns false when no records', () => {
    expect(tracker.shouldRetry()).toBe(false);
  });

  it('shouldRetry respects configured chance', () => {
    tracker.recordFailure(challenge1, 1);
    // With retryChance=1.0 it should always return true
    const alwaysTracker = new FailedChallengeTracker(1.0, 3);
    alwaysTracker.recordFailure(challenge1, 1);
    expect(alwaysTracker.shouldRetry()).toBe(true);

    // With retryChance=0 it should always return false
    const neverTracker = new FailedChallengeTracker(0, 3);
    neverTracker.recordFailure(challenge1, 1);
    expect(neverTracker.shouldRetry()).toBe(false);
  });

  it('getRetryChallenge returns a failed challenge', () => {
    tracker.recordFailure(challenge1, 1);
    tracker.recordFailure(challenge2, 1);
    const retry = tracker.getRetryChallenge();
    expect(retry).not.toBeNull();
    expect([challenge1.answer, challenge2.answer]).toContain(retry!.answer);
  });

  it('getRetryChallenge returns null when empty', () => {
    expect(tracker.getRetryChallenge()).toBeNull();
  });

  it('recordSuccess increments consecutiveCorrect', () => {
    tracker.recordFailure(challenge1, 1);
    tracker.recordSuccess(challenge1);
    const all = tracker.getAll();
    expect(all[0].consecutiveCorrect).toBe(1);
  });

  it('clears record after N consecutive correct answers', () => {
    tracker.recordFailure(challenge1, 1);
    tracker.recordSuccess(challenge1);
    tracker.recordSuccess(challenge1);
    tracker.recordSuccess(challenge1);
    expect(tracker.getAll()).toHaveLength(0);
  });

  it('resets consecutiveCorrect on new failure', () => {
    tracker.recordFailure(challenge1, 1);
    tracker.recordSuccess(challenge1);
    tracker.recordSuccess(challenge1);
    tracker.recordFailure(challenge1, 1);
    const all = tracker.getAll();
    expect(all[0].consecutiveCorrect).toBe(0);
    expect(all[0].failCount).toBe(2);
  });

  it('loadFrom/getAll roundtrip', () => {
    tracker.recordFailure(challenge1, 1);
    tracker.recordFailure(challenge2, 2);
    const saved = tracker.getAll();

    const newTracker = new FailedChallengeTracker(0.2, 3);
    newTracker.loadFrom(saved);
    const loaded = newTracker.getAll();

    expect(loaded).toHaveLength(2);
    expect(loaded.map(r => r.challenge.answer).sort()).toEqual(['3', '7']);
  });
});
