export type AthleteSide = 'BLUE' | 'RED';

export type ScoreAction = {
  refereeId: number;
  side: AthleteSide;
  points: number;
  button: number;
  timestamp: number;
};