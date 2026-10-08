import {
  ButtonMappingTarget,
  ControllerAssignment,
  RefereeButtonAction,
  RefereeButtonMappings,
} from '../../types/controller';

type ButtonMappingSettingsProps = {
  refereeCount: number;

  assignments: Record<
    number,
    ControllerAssignment
  >;

  connectedGamepads: Record<
    number,
    string
  >;

  mappings: RefereeButtonMappings;

  configuring:
    | ButtonMappingTarget
    | null;

  error: string | null;

  disabled?: boolean;

  onConfigure: (
    refereeId: number,
    action: RefereeButtonAction,
  ) => void;
};

const ACTIONS: {
  action: RefereeButtonAction;
  label: string;
}[] = [
  {
    action: 'blue2',
    label: 'Azul +2',
  },
  {
    action: 'blue3',
    label: 'Azul +3',
  },
  {
    action: 'red2',
    label: 'Vermelho +2',
  },
  {
    action: 'red3',
    label: 'Vermelho +3',
  },
];

export function ButtonMappingSettings({
  refereeCount,
  assignments,
  connectedGamepads,
  mappings,
  configuring,
  error,
  disabled = false,
  onConfigure,
}: ButtonMappingSettingsProps) {
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
        Configuração dos botões
      </h2>

      <p>
        Defina quais botões cada
        árbitro utilizará durante
        a luta.
      </p>

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

          const mapping =
            mappings[
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
                borderTop:
                  '1px solid #ddd',
                padding:
                  '20px 0',
              }}
            >
              <h3>
                Árbitro{' '}
                {refereeId}
              </h3>

              {!assignment && (
                <p>
                  Configure o
                  controle deste
                  árbitro primeiro.
                </p>
              )}

              {assignment && (
                <p>
                  Controle:{' '}
                  {
                    assignment.gamepadId
                  }
                  {' — '}
                  {connected
                    ? 'CONECTADO'
                    : 'DESCONECTADO'}
                </p>
              )}

              {mapping &&
                ACTIONS.map(
                  ({
                    action,
                    label,
                  }) => {
                    const isCurrent =
                      configuring
                        ?.refereeId ===
                        refereeId &&
                      configuring
                        ?.action ===
                        action;

                    return (
                      <div
                        key={
                          action
                        }
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 12,
                          marginBottom:
                            8,
                        }}
                      >
                        <div
                          style={{
                            width: 120,
                          }}
                        >
                          {label}
                        </div>

                        <div
                          style={{
                            width: 100,
                          }}
                        >
                          Botão{' '}
                          {
                            mapping[
                              action
                            ]
                          }
                        </div>

                        <button
                          disabled={
                            disabled ||
                            !assignment ||
                            !connected ||
                            (configuring !==
                              null &&
                              !isCurrent)
                          }
                          onClick={() =>
                            onConfigure(
                              refereeId,
                              action,
                            )
                          }
                        >
                          {isCurrent
                            ? 'Pressione um botão...'
                            : 'Alterar'}
                        </button>
                      </div>
                    );
                  },
                )}
            </div>
          );
        },
      )}
    </section>
  );
}