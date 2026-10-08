type PenaltyControlsProps = {
  blueGamJeom: number;
  redGamJeom: number;

  disabled?: boolean;

  onAddBlue: () => void;
  onRemoveBlue: () => void;

  onAddRed: () => void;
  onRemoveRed: () => void;
};

export function PenaltyControls({
  blueGamJeom,
  redGamJeom,

  disabled = false,

  onAddBlue,
  onRemoveBlue,

  onAddRed,
  onRemoveRed,
}: PenaltyControlsProps) {
  return (
    <section
      style={{
        border: '1px solid #ccc',
        padding: 20,
        marginBottom: 30,
      }}
    >
      <h2>Penalidades</h2>

      <div
        style={{
          display: 'flex',
          gap: 60,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3>AZUL</h3>

          <p>
            Gam-jeom: {blueGamJeom}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <button
              disabled={disabled}
              onClick={onAddBlue}
            >
              + Gam-jeom
            </button>

            <button
              disabled={
                disabled ||
                blueGamJeom === 0
              }
              onClick={onRemoveBlue}
            >
              Remover
            </button>
          </div>
        </div>

        <div>
          <h3>VERMELHO</h3>

          <p>
            Gam-jeom: {redGamJeom}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <button
              disabled={disabled}
              onClick={onAddRed}
            >
              + Gam-jeom
            </button>

            <button
              disabled={
                disabled ||
                redGamJeom === 0
              }
              onClick={onRemoveRed}
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}