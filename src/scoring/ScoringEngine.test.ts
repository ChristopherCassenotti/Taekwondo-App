import { describe, expect, it, vi } from 'vitest';

import { ScoringEngine } from './ScoringEngine';
import { ScoreAction } from '../types/scoring';

function createVote(
  refereeId: number,
  side: 'BLUE' | 'RED',
  points: number,
  timestamp: number,
): ScoreAction {
  return {
    refereeId,
    side,
    points,
    button: 0,
    timestamp,
  };
}

describe('ScoringEngine', () => {
  it('confirma ponto quando dois árbitros diferentes votam igual', () => {
    const onScoreConfirmed = vi.fn();

    const engine = new ScoringEngine({
      requiredReferees: 2,
      consensusWindowMs: 800,
      onScoreConfirmed,
    });

    engine.processVote(
      createVote(1, 'BLUE', 2, 1000),
    );

    engine.processVote(
      createVote(2, 'BLUE', 2, 1200),
    );

    expect(onScoreConfirmed).toHaveBeenCalledTimes(1);
  });

  it('não aceita dois votos do mesmo árbitro', () => {
    const onScoreConfirmed = vi.fn();

    const engine = new ScoringEngine({
      requiredReferees: 2,
      consensusWindowMs: 800,
      onScoreConfirmed,
    });

    engine.processVote(
      createVote(1, 'BLUE', 2, 1000),
    );

    engine.processVote(
      createVote(1, 'BLUE', 2, 1200),
    );

    expect(onScoreConfirmed).not.toHaveBeenCalled();
  });

  it('não mistura pontuações diferentes', () => {
    const onScoreConfirmed = vi.fn();

    const engine = new ScoringEngine({
      requiredReferees: 2,
      consensusWindowMs: 800,
      onScoreConfirmed,
    });

    engine.processVote(
      createVote(1, 'BLUE', 2, 1000),
    );

    engine.processVote(
      createVote(2, 'BLUE', 3, 1100),
    );

    expect(onScoreConfirmed).not.toHaveBeenCalled();
  });

  it('não mistura competidores diferentes', () => {
    const onScoreConfirmed = vi.fn();

    const engine = new ScoringEngine({
      requiredReferees: 2,
      consensusWindowMs: 800,
      onScoreConfirmed,
    });

    engine.processVote(
      createVote(1, 'BLUE', 2, 1000),
    );

    engine.processVote(
      createVote(2, 'RED', 2, 1100),
    );

    expect(onScoreConfirmed).not.toHaveBeenCalled();
  });

  it('não confirma votos fora da janela', () => {
    const onScoreConfirmed = vi.fn();

    const engine = new ScoringEngine({
      requiredReferees: 2,
      consensusWindowMs: 800,
      onScoreConfirmed,
    });

    engine.processVote(
      createVote(1, 'BLUE', 2, 1000),
    );

    engine.processVote(
      createVote(2, 'BLUE', 2, 2000),
    );

    expect(onScoreConfirmed).not.toHaveBeenCalled();
  });

  it('não confirma o mesmo ponto duas vezes com três árbitros', () => {
    const onScoreConfirmed = vi.fn();

    const engine = new ScoringEngine({
      requiredReferees: 2,
      consensusWindowMs: 800,
      onScoreConfirmed,
    });

    engine.processVote(
      createVote(1, 'BLUE', 2, 1000),
    );

    engine.processVote(
      createVote(2, 'BLUE', 2, 1100),
    );

    engine.processVote(
      createVote(3, 'BLUE', 2, 1200),
    );

    expect(onScoreConfirmed).toHaveBeenCalledTimes(1);
  });

  it('permite novo consenso depois da janela anterior', () => {
    const onScoreConfirmed = vi.fn();

    const engine = new ScoringEngine({
      requiredReferees: 2,
      consensusWindowMs: 800,
      onScoreConfirmed,
    });

    engine.processVote(
      createVote(1, 'BLUE', 2, 1000),
    );

    engine.processVote(
      createVote(2, 'BLUE', 2, 1100),
    );

    engine.processVote(
      createVote(1, 'BLUE', 2, 2000),
    );

    engine.processVote(
      createVote(3, 'BLUE', 2, 2100),
    );

    expect(onScoreConfirmed).toHaveBeenCalledTimes(2);
  });
});