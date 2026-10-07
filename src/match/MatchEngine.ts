import {
  AddScoreParams,
  MatchState,
} from '../types/match';

type MatchListener = (state: MatchState) => void;

export class MatchEngine {
  private state: MatchState;

  private listeners = new Set<MatchListener>();

  private timerId: ReturnType<typeof setInterval> | null = null;

  private startedAt: number | null = null;

  private remainingWhenStarted: number;

  constructor() {
    const roundDurationMs = 2 * 60 * 1000;

    this.remainingWhenStarted = roundDurationMs;

    this.state = {
      blueScore: 0,
      redScore: 0,

      round: 1,
      totalRounds: 3,

      roundDurationMs,
      remainingMs: roundDurationMs,

      status: 'IDLE',
    };
  }

  getState(): MatchState {
    return {
      ...this.state,
    };
  }

  subscribe(listener: MatchListener) {
    this.listeners.add(listener);

    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const state = this.getState();

    for (const listener of this.listeners) {
      listener(state);
    }
  }

  private startTimer() {
    this.stopTimer();

    this.timerId = setInterval(() => {
      this.updateTime();
    }, 50);
  }

  private stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);

      this.timerId = null;
    }
  }

  private updateTime() {
    if (
      this.state.status !== 'RUNNING' ||
      this.startedAt === null
    ) {
      return;
    }

    const elapsed =
      performance.now() - this.startedAt;

    const remaining = Math.max(
      0,
      this.remainingWhenStarted - elapsed,
    );

    this.state.remainingMs = remaining;

    if (remaining <= 0) {
      this.state.remainingMs = 0;

      this.state.status = 'ROUND_ENDED';

      this.startedAt = null;

      this.stopTimer();
    }

    this.emit();
  }

  addScore({
    side,
    points,
  }: AddScoreParams) {
    if (points <= 0) {
      return;
    }

    if (side === 'BLUE') {
      this.state.blueScore += points;
    }

    if (side === 'RED') {
      this.state.redScore += points;
    }

    this.emit();
  }

  removeScore({
    side,
    points,
  }: AddScoreParams) {
    if (points <= 0) {
      return;
    }

    if (side === 'BLUE') {
      this.state.blueScore = Math.max(
        0,
        this.state.blueScore - points,
      );
    }

    if (side === 'RED') {
      this.state.redScore = Math.max(
        0,
        this.state.redScore - points,
      );
    }

    this.emit();
  }

  start() {
    if (
      this.state.status === 'RUNNING' ||
      this.state.status === 'FINISHED' ||
      this.state.status === 'ROUND_ENDED'
    ) {
      return;
    }

    this.remainingWhenStarted =
      this.state.remainingMs;

    this.startedAt = performance.now();

    this.state.status = 'RUNNING';

    this.startTimer();

    this.emit();
  }

  pause() {
    if (this.state.status !== 'RUNNING') {
      return;
    }

    this.updateTime();

    this.remainingWhenStarted =
      this.state.remainingMs;

    this.startedAt = null;

    this.state.status = 'PAUSED';

    this.stopTimer();

    this.emit();
  }

  nextRound() {
    if (this.state.status === 'RUNNING') {
      return;
    }

    if (
      this.state.round >=
      this.state.totalRounds
    ) {
      this.finish();

      return;
    }

    this.state.round += 1;

    this.state.remainingMs =
      this.state.roundDurationMs;

    this.remainingWhenStarted =
      this.state.roundDurationMs;

    this.startedAt = null;

    this.state.status = 'IDLE';

    this.emit();
  }

  finish() {
    this.stopTimer();

    this.startedAt = null;

    this.state.status = 'FINISHED';

    this.emit();
  }

  reset() {
    this.stopTimer();

    this.startedAt = null;

    this.state = {
      blueScore: 0,
      redScore: 0,

      round: 1,
      totalRounds: 3,

      roundDurationMs: 2 * 60 * 1000,
      remainingMs: 2 * 60 * 1000,

      status: 'IDLE',
    };

    this.remainingWhenStarted =
      this.state.remainingMs;

    this.emit();
  }
}