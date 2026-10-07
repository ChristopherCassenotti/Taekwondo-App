import { AthleteSide } from '../../types/scoring';

type RefereeSimulatorProps = {
  refereeCount: number;

  disabled?: boolean;

  onVote: (
    refereeId: number,
    side: AthleteSide,
    points: number,
  ) => void;
};

export function RefereeSimulator({
  refereeCount,
  disabled = false,
  onVote,
}: RefereeSimulatorProps) {
  const referees = Array.from(
    {
      length: refereeCount,
    },
    (_, index) => index + 1,
  );

  return (
    <section
      style={{
        border: '1px solid #ccc',
        padding: 20,
        marginBottom: 30,
      }}
    >
      <h2>
        Simulador dos árbitros
      </h2>

      {referees.map(
        (refereeId) => (
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
                flexWrap: 'wrap',
              }}
            >
              <button
                disabled={disabled}
                onClick={() =>
                  onVote(
                    refereeId,
                    'BLUE',
                    2,
                  )
                }
              >
                Azul +2
              </button>

              <button
                disabled={disabled}
                onClick={() =>
                  onVote(
                    refereeId,
                    'BLUE',
                    3,
                  )
                }
              >
                Azul +3
              </button>

              <button
                disabled={disabled}
                onClick={() =>
                  onVote(
                    refereeId,
                    'RED',
                    2,
                  )
                }
              >
                Vermelho +2
              </button>

              <button
                disabled={disabled}
                onClick={() =>
                  onVote(
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
        ),
      )}
    </section>
  );
}