import { useEffect, useRef } from 'react';

import {
  RefereeButtonMappings,
} from '../types/controller';

import {
  AthleteSide,
  ScoreAction,
} from '../types/scoring';

type UseGamepadEventsProps = {
  onAction: (
    action: ScoreAction,
  ) => void;

  // gamepadIndex -> refereeId
  assignments: Record<
    number,
    number
  >;

  // refereeId -> configuração dos botões
  buttonMappings: RefereeButtonMappings;
};

type ResolvedAction = {
  side: AthleteSide;
  points: number;
};

function resolveButtonAction(
  buttonIndex: number,
  mapping:
    | RefereeButtonMappings[number]
    | undefined,
): ResolvedAction | null {
  if (!mapping) {
    return null;
  }

  if (
    buttonIndex === mapping.blue2
  ) {
    return {
      side: 'BLUE',
      points: 2,
    };
  }

  if (
    buttonIndex === mapping.blue3
  ) {
    return {
      side: 'BLUE',
      points: 3,
    };
  }

  if (
    buttonIndex === mapping.red2
  ) {
    return {
      side: 'RED',
      points: 2,
    };
  }

  if (
    buttonIndex === mapping.red3
  ) {
    return {
      side: 'RED',
      points: 3,
    };
  }

  return null;
}

export function useGamepadEvents({
  onAction,
  assignments,
  buttonMappings,
}: UseGamepadEventsProps) {
  const previousButtons =
    useRef<
      Record<string, boolean>
    >({});

  useEffect(() => {
    let animationFrame = 0;

    const readGamepads = () => {
      const gamepads =
        navigator.getGamepads();

      for (
        const gamepad of gamepads
      ) {
        if (!gamepad) {
          continue;
        }

        const refereeId =
          assignments[
            gamepad.index
          ];

        if (!refereeId) {
          continue;
        }

        const mapping =
          buttonMappings[
            refereeId
          ];

        gamepad.buttons.forEach(
          (
            button,
            buttonIndex,
          ) => {
            const key =
              `${gamepad.index}-${buttonIndex}`;

            const wasPressed =
              previousButtons
                .current[key] ??
              false;

            const isPressed =
              button.pressed;

            if (
              isPressed &&
              !wasPressed
            ) {
              const action =
                resolveButtonAction(
                  buttonIndex,
                  mapping,
                );

              if (action) {
                onAction({
                  refereeId,

                  side:
                    action.side,

                  points:
                    action.points,

                  button:
                    buttonIndex,

                  timestamp:
                    performance.now(),
                });
              }
            }

            previousButtons.current[
              key
            ] = isPressed;
          },
        );
      }

      animationFrame =
        requestAnimationFrame(
          readGamepads,
        );
    };

    readGamepads();

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [
    onAction,
    assignments,
    buttonMappings,
  ]);
}