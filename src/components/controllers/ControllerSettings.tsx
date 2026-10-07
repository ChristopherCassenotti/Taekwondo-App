import { ControllerAssignment } from '../../types/controller';

type ControllerSettingsProps = {
  refereeCount: number;

  assignments: Record<
    number,
    ControllerAssignment
  >;

  connectedGamepads: Record<
    number,
    string
  >;

  assigningRefereeId: number | null;

  error: string | null;

  disabled?: boolean;

  onConfigure: (
    refereeId: number,
  ) => void;
};

export function ControllerSettings({
  refereeCount,
  assignments,
  connectedGamepads,
  assigningRefereeId,
  error,
  disabled = false,
  onConfigure,
}: ControllerSettingsProps) {
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
        Configuração dos controles
      </h2>

      {error && (
        <p
          style={{
            fontWeight: 'bold',
          }}
        >
          {error}
        </p>
      )}

      {referees.map(
        (refereeId) => {
          const assignment =
            assignments[
              refereeId
            ];

          const connected =
            assignment
              ? Boolean(
                  connectedGamepads[
                    assignment
                      .gamepadIndex
                  ],
                )
              : false;

          return (
            <div
              key={refereeId}
              style={{
                borderBottom:
                  '1px solid #ddd',
                padding:
                  '16px 0',
              }}
            >
              <strong>
                Árbitro{' '}
                {refereeId}
              </strong>

              {!assignment && (
                <p>
                  Nenhum controle
                  configurado.
                </p>
              )}

              {assignment && (
                <>
                  <p>
                    {
                      assignment.gamepadId
                    }
                  </p>

                  <p>
                    Índice:{' '}
                    {
                      assignment.gamepadIndex
                    }
                  </p>

                  <p>
                    {connected
                      ? 'CONECTADO'
                      : 'DESCONECTADO'}
                  </p>
                </>
              )}

              <button
                disabled={
                  disabled
                }
                onClick={() =>
                  onConfigure(
                    refereeId,
                  )
                }
              >
                {assigningRefereeId ===
                refereeId
                  ? 'Pressione qualquer botão...'
                  : assignment
                    ? 'Reconfigurar'
                    : 'Configurar controle'}
              </button>
            </div>
          );
        },
      )}
    </section>
  );
}