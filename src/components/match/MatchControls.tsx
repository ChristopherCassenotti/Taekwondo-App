import { MatchStatus } from '../../types/match';

type MatchControlsProps = {
  status: MatchStatus;

  onStart: () => void;
  onPause: () => void;
  onNextRound: () => void;
  onReset: () => void;
};

export function MatchControls({
  status,
  onStart,
  onPause,
  onNextRound,
  onReset,
}: MatchControlsProps) {
  const canStart =
    status === 'IDLE' ||
    status === 'PAUSED';

  const canPause =
    status === 'RUNNING';

  const canNextRound =
    status !== 'RUNNING' &&
    status !== 'FINISHED';

  return (
    <section
      style={{
        border: '1px solid #ccc',
        padding: 20,
        marginBottom: 30,
      }}
    >
      <h2>Controle da luta</h2>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <button
          disabled={!canStart}
          onClick={onStart}
        >
          Iniciar
        </button>

        <button
          disabled={!canPause}
          onClick={onPause}
        >
          Pausar
        </button>

        <button
          disabled={!canNextRound}
          onClick={onNextRound}
        >
          Próximo round
        </button>

        <button onClick={onReset}>
          Resetar luta
        </button>
      </div>
    </section>
  );
}