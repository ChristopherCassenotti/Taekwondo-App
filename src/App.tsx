import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useGamepadEvents } from './hooks/useGamepadEvents';

import { ScoringEngine } from './scoring/ScoringEngine';
import { MatchEngine } from './match/MatchEngine';

import { ScoreAction } from './types/scoring';
import { MatchState } from './types/match';

export function App() {
  const matchEngineRef =
    useRef<MatchEngine | null>(null);

  const scoringEngineRef =
    useRef<ScoringEngine | null>(null);

  if (!matchEngineRef.current) {
    matchEngineRef.current =
      new MatchEngine();
  }

  const [matchState, setMatchState] =
    useState<MatchState>(
      matchEngineRef.current.getState(),
    );

  const [rawVotes, setRawVotes] =
    useState<ScoreAction[]>([]);

  useEffect(() => {
    const unsubscribe =
      matchEngineRef.current!.subscribe(
        (state) => {
          setMatchState(state);
        },
      );

    return unsubscribe;
  }, []);

  if (!scoringEngineRef.current) {
    scoringEngineRef.current =
      new ScoringEngine({
        requiredReferees: 2,

        consensusWindowMs: 800,

        onScoreConfirmed: (action) => {
          matchEngineRef.current?.addScore({
            side: action.side,
            points: action.points,
          });
        },
      });
  }

  const processAction = useCallback(
    (action: ScoreAction) => {
      setRawVotes((current) => [
        action,
        ...current.slice(0, 19),
      ]);

      scoringEngineRef.current?.processVote(
        action,
      );
    },
    [],
  );

  useGamepadEvents({
    onAction: processAction,
  });

  const simulateVote = (
    refereeId: number,
    side: 'BLUE' | 'RED',
    points: number,
  ) => {
    processAction({
      refereeId,
      side,
      points,
      button: -1,
      timestamp: performance.now(),
    });
  };

  const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.ceil(
    milliseconds / 1000,
  );

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, '0')}`;
  };

  return (
    <main
      style={{
        padding: 32,
        fontFamily: 'Arial',
      }}
    >
      <h1>Taekwondo Score</h1>

      <h2>
        Round {matchState.round} de{' '}
        {matchState.totalRounds}
      </h2>
        
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            marginBottom: 20,
          }}
        >
          {formatTime(matchState.remainingMs)}
        </div>
      
      <p>
        Estado: {matchState.status}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 80,
          marginBottom: 30,
        }}
      >
        <div>
          <h2>AZUL</h2>

          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
            }}
          >
            {matchState.blueScore}
          </div>

          <button
            onClick={() =>
              matchEngineRef.current?.removeScore({
                side: 'BLUE',
                points: 1,
              })
            }
          >
            Remover 1
          </button>
        </div>

        <div>
          <h2>VERMELHO</h2>

          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
            }}
          >
            {matchState.redScore}
          </div>

          <button
            onClick={() =>
              matchEngineRef.current?.removeScore({
                side: 'RED',
                points: 1,
              })
            }
          >
            Remover 1
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 30,
        }}
      >
        <button
          onClick={() =>
            matchEngineRef.current?.start()
          }
        >
          Iniciar
        </button>

        <button
          onClick={() =>
            matchEngineRef.current?.pause()
          }
        >
          Pausar
        </button>

        <button
          onClick={() =>
            matchEngineRef.current?.nextRound()
          }
        >
          Próximo round
        </button>

        <button
          onClick={() => {
            matchEngineRef.current?.reset();
            scoringEngineRef.current?.reset();
          }}
        >
          Resetar luta
        </button>
      </div>

      <hr />

      <h2>Simulador dos árbitros</h2>

      {[1, 2, 3, 4].map((refereeId) => (
        <div
          key={refereeId}
          style={{
            marginBottom: 20,
          }}
        >
          <strong>
            Árbitro {refereeId}
          </strong>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 8,
            }}
          >
            <button
              onClick={() =>
                simulateVote(
                  refereeId,
                  'BLUE',
                  2,
                )
              }
            >
              Azul +2
            </button>

            <button
              onClick={() =>
                simulateVote(
                  refereeId,
                  'BLUE',
                  3,
                )
              }
            >
              Azul +3
            </button>

            <button
              onClick={() =>
                simulateVote(
                  refereeId,
                  'RED',
                  2,
                )
              }
            >
              Vermelho +2
            </button>

            <button
              onClick={() =>
                simulateVote(
                  refereeId,
                  'RED',
                  3,
                )
              }
            >
              Vermelho +3
            </button>
          </div>
        </div>
      ))}

      <hr />

      <h2>Últimos votos</h2>

      {rawVotes.map((vote, index) => (
        <div
          key={`${vote.timestamp}-${index}`}
        >
          J{vote.refereeId}
          {' → '}
          {vote.side === 'BLUE'
            ? 'AZUL'
            : 'VERMELHO'}
          {' +'}
          {vote.points}
        </div>
      ))}
    </main>
  );
}