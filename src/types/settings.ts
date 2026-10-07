export type FightSettings = {
  totalRounds: number;
  roundDurationSeconds: number;

  refereeCount: number;
  requiredReferees: number;

  consensusWindowMs: number;
};