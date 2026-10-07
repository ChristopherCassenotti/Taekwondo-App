import { ScoreAction } from '../types/scoring';

type PendingVoteGroup = {
  startedAt: number;
  referees: Set<number>;
  confirmed: boolean;
};

type ScoringEngineOptions = {
  requiredReferees: number;
  consensusWindowMs: number;
  onScoreConfirmed: (action: ScoreAction) => void;
};

export class ScoringEngine {
  private requiredReferees: number;
  private consensusWindowMs: number;
  private onScoreConfirmed: (action: ScoreAction) => void;

  private pendingVotes = new Map<string, PendingVoteGroup>();

  constructor(options: ScoringEngineOptions) {
    this.requiredReferees = options.requiredReferees;
    this.consensusWindowMs = options.consensusWindowMs;
    this.onScoreConfirmed = options.onScoreConfirmed;
  }

  processVote(action: ScoreAction) {
    const key = `${action.side}-${action.points}`;

    let group = this.pendingVotes.get(key);

    if (
      !group ||
      action.timestamp - group.startedAt > this.consensusWindowMs
    ) {
      group = {
        startedAt: action.timestamp,
        referees: new Set<number>(),
        confirmed: false,
      };

      this.pendingVotes.set(key, group);
    }

    // Se esse ponto já foi confirmado dentro da janela,
    // ignora votos adicionais.
    if (group.confirmed) {
      return;
    }

    // O mesmo árbitro não pode votar duas vezes
    group.referees.add(action.refereeId);

    console.log(
      `[CONSENSO] ${key}: ${group.referees.size}/${this.requiredReferees}`,
    );

    if (group.referees.size >= this.requiredReferees) {
      group.confirmed = true;

      this.onScoreConfirmed(action);
    }
  }

  reset() {
    this.pendingVotes.clear();
  }
}