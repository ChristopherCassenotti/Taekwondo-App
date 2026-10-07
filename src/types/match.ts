import { AthleteSide } from './scoring';

export type MatchStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'ROUND_ENDED'
  | 'FINISHED';

export type MatchState = {
  blueScore: number;
  redScore: number;

  round: number;
  totalRounds: number;

  roundDurationMs: number;
  remainingMs: number;

  status: MatchStatus;
};

export type AddScoreParams = {
  side: AthleteSide;
  points: number;
};