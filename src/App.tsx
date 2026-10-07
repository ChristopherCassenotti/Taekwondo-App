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

  const [roundDurationSeconds, setRoundDurationSeconds] =
    useState(120);

  const [totalRounds, setTotalRounds] =
    useState(3);

  const [refereeCount, setRefereeCount] =
    useState(4);

  const [requiredReferees, setRequiredReferees] =
    useState(2);

  const [consensusWindowMs, setConsensusWindowMs] =
  useState(800);

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
      const matchEngine = matchEngineRef.current;
      const scoringEngine = scoringEngineRef.current;

      if (!matchEngine || !scoringEngine) {
        return;
      }

      const match = matchEngine.getState();

      if (match.status !== 'RUNNING') {
        console.log(
          `[IGNORADO] J${action.refereeId} - luta não está rodando`,
        );

        return;
      }

      setRawVotes((current) => [
        action,
        ...current.slice(0, 19),
      ]);

      scoringEngine.processVote(action);
    },
    [],
  );
  
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

  const handleStart = () => {
    scoringEngineRef.current?.reset();
    matchEngineRef.current?.start();
  };

  const handlePause = () => {
    matchEngineRef.current?.pause();

    scoringEngineRef.current?.reset();
  };

  const handleNextRound = () => {
    scoringEngineRef.current?.reset();

    matchEngineRef.current?.nextRound();
  };

  const handleReset = () => {
    scoringEngineRef.current?.reset();
    matchEngineRef.current?.reset();

    setRawVotes([]);
  };

  const handleApplySettings = () => {
  if (
    requiredReferees >
    refereeCount
  ) {
    alert(
      'O consenso não pode exigir mais árbitros do que existem na luta.',
    );

    return;
  }

  if (requiredReferees < 1) {
    return;
  }

  if (totalRounds < 1) {
    return;
  }

  if (roundDurationSeconds < 1) {
    return;
  }

  if (consensusWindowMs < 100) {
    return;
  }

  const configured =
    matchEngineRef.current?.configure({
      totalRounds,

      roundDurationMs:
        roundDurationSeconds * 1000,
    });

  if (!configured) {
    alert(
      'As configurações só podem ser alteradas antes do início da luta.',
    );

    return;
  }

  scoringEngineRef.current?.configure({
    requiredReferees,
    consensusWindowMs,
  });

  alert(
    'Configurações aplicadas.',
  );
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
        <section
  style={{
    border: '1px solid #ccc',
    padding: 20,
    marginBottom: 30,
  }}
>
  <h2>Configuração da luta</h2>

  <div
    style={{
      display: 'grid',
      gap: 12,
      maxWidth: 400,
    }}
  >
    <label>
      Quantidade de rounds

      <input
        type="number"
        min={1}
        value={totalRounds}
        onChange={(event) =>
          setTotalRounds(
            Number(event.target.value),
          )
        }
      />
    </label>

    <label>
      Duração do round (segundos)

      <input
        type="number"
        min={1}
        value={roundDurationSeconds}
        onChange={(event) =>
          setRoundDurationSeconds(
            Number(event.target.value),
          )
        }
      />
    </label>

    <label>
      Quantidade de árbitros

      <input
        type="number"
        min={1}
        max={4}
        value={refereeCount}
        onChange={(event) =>
          setRefereeCount(
            Number(event.target.value),
          )
        }
      />
    </label>

    <label>
      Árbitros necessários para consenso

      <input
        type="number"
        min={1}
        max={refereeCount}
        value={requiredReferees}
        onChange={(event) =>
          setRequiredReferees(
            Number(event.target.value),
          )
        }
      />
    </label>

    <label>
      Janela de consenso (ms)

      <input
        type="number"
        min={100}
        step={50}
        value={consensusWindowMs}
        onChange={(event) =>
          setConsensusWindowMs(
            Number(event.target.value),
          )
        }
      />
    </label>

    <button
      onClick={handleApplySettings}
    >
      Aplicar configurações
    </button>
  </div>
</section>
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
        <button onClick={handleStart}>
          Iniciar
        </button>

        <button onClick={handlePause}>
  Pausar
</button>

<button onClick={handleNextRound}>
  Próximo round
</button>

<button onClick={handleReset}>
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