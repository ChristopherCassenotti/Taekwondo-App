import { MatchState } from '../../types/match';

type ScoreboardProps = {
  match: MatchState;

  onRemoveBlue: () => void;
  onRemoveRed: () => void;
};

function formatTime(
  milliseconds: number,
) {
  const totalSeconds = Math.ceil(
    milliseconds / 1000,
  );

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds =
    totalSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

export function Scoreboard({
  match,
  onRemoveBlue,
  onRemoveRed,
}: ScoreboardProps) {
  return (
    <section
      style={{
        border: '1px solid #ccc',
        padding: 20,
        marginBottom: 30,
      }}
    >
      <h2>
        Round {match.round} de{' '}
        {match.totalRounds}
      </h2>

      <p>
        Estado: {match.status}
      </p>

      <div
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          marginBottom: 30,
        }}
      >
        {formatTime(
          match.remainingMs,
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 80,
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
            {match.blueScore}
          </div>

            <p>
              Gam-jeom: {match.blueGamJeom}
            </p>
          
          <button
            onClick={onRemoveBlue}
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
            {match.redScore}
          </div>

            <p>
              Gam-jeom: {match.redGamJeom}
            </p>

          <button
            onClick={onRemoveRed}
          >
            Remover 1
          </button>
        </div>
      </div>
    </section>
  );
}