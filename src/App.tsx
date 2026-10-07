import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ControllerSettings } from './components/controllers/ControllerSettings';

import { ControllerAssignment } from './types/controller';

import { MatchControls } from './components/match/MatchControls';
import { MatchSettings } from './components/match/MatchSettings';
import { Scoreboard } from './components/match/Scoreboard';

import { RefereeSimulator } from './components/referees/RefereeSimulator';
import { VoteLog } from './components/debug/VoteLog';

import { useGamepadEvents } from './hooks/useGamepadEvents';

import { MatchEngine } from './match/MatchEngine';
import { ScoringEngine } from './scoring/ScoringEngine';

import { MatchState } from './types/match';

import {
  AthleteSide,
  ScoreAction,
} from './types/scoring';

import { FightSettings } from './types/settings';

const INITIAL_SETTINGS: FightSettings = {
  totalRounds: 3,

  roundDurationSeconds: 120,

  refereeCount: 4,

  requiredReferees: 2,

  consensusWindowMs: 800,
};

export function App() {
  const [
    settings,
    setSettings,
  ] = useState<FightSettings>(
    INITIAL_SETTINGS,
  );

  const [
  controllerAssignments,
  setControllerAssignments,
] = useState<
  Record<
    number,
    ControllerAssignment
  >
>({});

const [
  assigningRefereeId,
  setAssigningRefereeId,
] = useState<
  number | null
>(null);

const [
  assignmentError,
  setAssignmentError,
] = useState<
  string | null
>(null);

const [
  connectedGamepads,
  setConnectedGamepads,
] = useState<
  Record<number, string>
>({});

const assignmentPreviousButtons =
  useRef<
    Record<string, boolean>
  >({});

  useEffect(() => {
  const updateConnectedGamepads =
    () => {
      const gamepads =
        navigator.getGamepads();

      const connected: Record<
        number,
        string
      > = {};

      for (
        const gamepad of gamepads
      ) {
        if (!gamepad) {
          continue;
        }

        connected[
          gamepad.index
        ] = gamepad.id;
      }

      setConnectedGamepads(
        connected,
      );
    };

  updateConnectedGamepads();

  window.addEventListener(
    'gamepadconnected',
    updateConnectedGamepads,
  );

  window.addEventListener(
    'gamepaddisconnected',
    updateConnectedGamepads,
  );

  return () => {
    window.removeEventListener(
      'gamepadconnected',
      updateConnectedGamepads,
    );

    window.removeEventListener(
      'gamepaddisconnected',
      updateConnectedGamepads,
    );
  };
}, []);

const startControllerAssignment = (
  refereeId: number,
) => {
  const snapshot: Record<
    string,
    boolean
  > = {};

  const gamepads =
    navigator.getGamepads();

  for (const gamepad of gamepads) {
    if (!gamepad) {
      continue;
    }

    gamepad.buttons.forEach(
      (button, buttonIndex) => {
        snapshot[
          `${gamepad.index}-${buttonIndex}`
        ] = button.pressed;
      },
    );
  }

  assignmentPreviousButtons.current =
    snapshot;

  setAssignmentError(null);

  setAssigningRefereeId(
    refereeId,
  );
};

useEffect(() => {
  if (
    assigningRefereeId === null
  ) {
    return;
  }

  let animationFrame = 0;

  let captured = false;

  const detectController =
    () => {
      const gamepads =
        navigator.getGamepads();

      for (
        const gamepad of gamepads
      ) {
        if (!gamepad) {
          continue;
        }

        for (
          let buttonIndex = 0;
          buttonIndex <
          gamepad.buttons.length;
          buttonIndex++
        ) {
          const button =
            gamepad.buttons[
              buttonIndex
            ];

          const key =
            `${gamepad.index}-${buttonIndex}`;

          const wasPressed =
            assignmentPreviousButtons
              .current[key] ??
            false;

          if (
            button.pressed &&
            !wasPressed
          ) {
            const alreadyAssigned =
              Object.entries(
                controllerAssignments,
              ).find(
                ([
                  refereeId,
                  assignment,
                ]) =>
                  assignment
                    .gamepadIndex ===
                    gamepad.index &&
                  Number(
                    refereeId,
                  ) !==
                    assigningRefereeId,
              );

            if (
              alreadyAssigned
            ) {
              setAssignmentError(
                `Esse controle já pertence ao Árbitro ${alreadyAssigned[0]}.`,
              );

              setAssigningRefereeId(
                null,
              );

              captured = true;

              break;
            }

            setControllerAssignments(
              (current) => ({
                ...current,

                [assigningRefereeId]:
                  {
                    gamepadIndex:
                      gamepad.index,

                    gamepadId:
                      gamepad.id,
                  },
              }),
            );

            setAssignmentError(
              null,
            );

            setAssigningRefereeId(
              null,
            );

            captured = true;

            break;
          }

          assignmentPreviousButtons.current[
            key
          ] = button.pressed;
        }

        if (captured) {
          break;
        }
      }

      if (!captured) {
        animationFrame =
          requestAnimationFrame(
            detectController,
          );
      }
    };

  detectController();

  return () => {
    cancelAnimationFrame(
      animationFrame,
    );
  };
}, [
  assigningRefereeId,
  controllerAssignments,
]);
const gamepadAssignments =
  useMemo(() => {
    const result: Record<
      number,
      number
    > = {};

    for (
      const [
        refereeId,
        assignment,
      ] of Object.entries(
        controllerAssignments,
      )
    ) {
      result[
        assignment.gamepadIndex
      ] = Number(
        refereeId,
      );
    }

    return result;
  }, [
    controllerAssignments,
  ]);

  /*
   * MATCH ENGINE
   */

  const matchEngineRef =
    useRef<MatchEngine | null>(
      null,
    );

  if (!matchEngineRef.current) {
    matchEngineRef.current =
      new MatchEngine({
        totalRounds:
          INITIAL_SETTINGS.totalRounds,

        roundDurationMs:
          INITIAL_SETTINGS
            .roundDurationSeconds *
          1000,
      });
  }

  /*
   * ESTADO DA LUTA
   */

  const [
    matchState,
    setMatchState,
  ] = useState<MatchState>(
    matchEngineRef.current.getState(),
  );

  /*
   * LOG DE VOTOS
   */

  const [
    rawVotes,
    setRawVotes,
  ] = useState<ScoreAction[]>([]);

  /*
   * SCORING ENGINE
   */

  const scoringEngineRef =
    useRef<ScoringEngine | null>(
      null,
    );

  if (!scoringEngineRef.current) {
    scoringEngineRef.current =
      new ScoringEngine({
        requiredReferees:
          INITIAL_SETTINGS
            .requiredReferees,

        consensusWindowMs:
          INITIAL_SETTINGS
            .consensusWindowMs,

        onScoreConfirmed: (
          action,
        ) => {
          matchEngineRef.current?.addScore(
            {
              side: action.side,

              points:
                action.points,
            },
          );
        },
      });
  }

  /*
   * ASSINATURA DO MATCH ENGINE
   */

  useEffect(() => {
    const unsubscribe =
      matchEngineRef.current!.subscribe(
        (state) => {
          setMatchState(state);
        },
      );

    return unsubscribe;
  }, []);

  /*
   * RECEBE UM VOTO
   */

  const processAction =
    useCallback(
      (
        action: ScoreAction,
      ) => {
        const matchEngine =
          matchEngineRef.current;

        const scoringEngine =
          scoringEngineRef.current;

        if (
          !matchEngine ||
          !scoringEngine
        ) {
          return;
        }

        const match =
          matchEngine.getState();

        /*
         * Só aceitamos votos
         * durante a luta.
         */

        if (
          match.status !==
          'RUNNING'
        ) {
          console.log(
            `[IGNORADO] J${action.refereeId} - luta não está rodando`,
          );

          return;
        }

        /*
         * Registra no log.
         */

        setRawVotes(
          (current) => [
            action,

            ...current.slice(
              0,
              19,
            ),
          ],
        );

        /*
         * Envia para o
         * ScoringEngine.
         */

        scoringEngine.processVote(
          action,
        );
      },
      [],
    );

  /*
   * JOYSTICKS
   */

useGamepadEvents({
  onAction: processAction,

  assignments:
    gamepadAssignments,
});

  /*
   * CONTROLES DA LUTA
   */

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

  /*
   * CONFIGURAÇÕES
   */

  const handleApplySettings = (
    nextSettings: FightSettings,
  ) => {
    if (
      nextSettings.totalRounds <
      1
    ) {
      alert(
        'A luta precisa ter pelo menos 1 round.',
      );

      return;
    }

    if (
      nextSettings
        .roundDurationSeconds <
      1
    ) {
      alert(
        'A duração do round precisa ser maior que zero.',
      );

      return;
    }

    if (
      nextSettings.refereeCount <
        1 ||
      nextSettings.refereeCount >
        4
    ) {
      alert(
        'A quantidade de árbitros deve ficar entre 1 e 4.',
      );

      return;
    }

    if (
      nextSettings
        .requiredReferees <
        1 ||
      nextSettings
        .requiredReferees >
        nextSettings.refereeCount
    ) {
      alert(
        'O consenso não pode exigir mais árbitros do que existem na luta.',
      );

      return;
    }

    if (
      nextSettings
        .consensusWindowMs <
      100
    ) {
      alert(
        'A janela de consenso deve ser de pelo menos 100 ms.',
      );

      return;
    }

    const configured =
      matchEngineRef.current?.configure(
        {
          totalRounds:
            nextSettings
              .totalRounds,

          roundDurationMs:
            nextSettings
              .roundDurationSeconds *
            1000,
        },
      );

    if (!configured) {
      alert(
        'As configurações só podem ser alteradas antes do início da luta.',
      );

      return;
    }

    scoringEngineRef.current?.configure(
      {
        requiredReferees:
          nextSettings
            .requiredReferees,

        consensusWindowMs:
          nextSettings
            .consensusWindowMs,
      },
    );

    setSettings(
      nextSettings,
    );
  };

  /*
   * SIMULADOR
   */

  const simulateVote = (
    refereeId: number,
    side: AthleteSide,
    points: number,
  ) => {
    processAction({
      refereeId,
      side,
      points,

      button: -1,

      timestamp:
        performance.now(),
    });
  };

  /*
   * CORREÇÃO MANUAL
   */

  const handleRemoveBlue =
    () => {
      matchEngineRef.current?.removeScore(
        {
          side: 'BLUE',

          points: 1,
        },
      );
    };

  const handleRemoveRed =
    () => {
      matchEngineRef.current?.removeScore(
        {
          side: 'RED',

          points: 1,
        },
      );
    };

  /*
   * CONFIGURAÇÃO BLOQUEADA
   * DEPOIS QUE A LUTA COMEÇA.
   */

  const settingsLocked =
    matchState.status !==
      'IDLE' ||
    matchState.round !== 1 ||
    matchState.blueScore !==
      0 ||
    matchState.redScore !==
      0;

  return (
    <main
      style={{
        padding: 32,

        fontFamily:
          'Arial, sans-serif',

        maxWidth: 1200,

        margin: '0 auto',
      }}
    >
      <h1>
        Taekwondo Score
      </h1>

      <MatchSettings
        value={settings}
        disabled={
          settingsLocked
        }
        onApply={
          handleApplySettings
        }
      />
<ControllerSettings
  refereeCount={
    settings.refereeCount
  }

  assignments={
    controllerAssignments
  }

  connectedGamepads={
    connectedGamepads
  }

  assigningRefereeId={
    assigningRefereeId
  }

  error={
    assignmentError
  }

  disabled={
    settingsLocked
  }

  onConfigure={
    startControllerAssignment
  }
/>
      <Scoreboard
        match={matchState}
        onRemoveBlue={
          handleRemoveBlue
        }
        onRemoveRed={
          handleRemoveRed
        }
      />

      <MatchControls
        status={
          matchState.status
        }
        onStart={
          handleStart
        }
        onPause={
          handlePause
        }
        onNextRound={
          handleNextRound
        }
        onReset={
          handleReset
        }
      />

      <RefereeSimulator
        refereeCount={
          settings.refereeCount
        }
        disabled={
          matchState.status !==
          'RUNNING'
        }
        onVote={
          simulateVote
        }
      />

      <VoteLog
        votes={rawVotes}
      />
    </main>
  );
}