import { useEffect, useRef } from 'react';
import { ScoreAction } from '../types/scoring';

type UseGamepadEventsProps = {
  onAction: (action: ScoreAction) => void;
};

export function useGamepadEvents({
  onAction,
}: UseGamepadEventsProps) {
  const previousButtons = useRef<Record<string, boolean>>({});

  useEffect(() => {
    let animationFrame: number;

    const buttonMapping: Record<
      number,
      {
        side: 'BLUE' | 'RED';
        points: number;
      }
    > = {
      0: {
        side: 'BLUE',
        points: 2,
      },

      1: {
        side: 'BLUE',
        points: 3,
      },

      2: {
        side: 'RED',
        points: 2,
      },

      3: {
        side: 'RED',
        points: 3,
      },
    };

    const readGamepads = () => {
      const gamepads = navigator.getGamepads();

      for (const gamepad of gamepads) {
        if (!gamepad) continue;

        gamepad.buttons.forEach((button, buttonIndex) => {
          const key = `${gamepad.index}-${buttonIndex}`;

          const wasPressed =
            previousButtons.current[key] ?? false;

          const isPressed = button.pressed;

          // Só dispara no momento em que:
          // false → true
          if (isPressed && !wasPressed) {
            const mapping = buttonMapping[buttonIndex];

            if (mapping) {
              onAction({
                refereeId: gamepad.index + 1,
                side: mapping.side,
                points: mapping.points,
                button: buttonIndex,
                timestamp: performance.now(),
              });
            }
          }

          previousButtons.current[key] = isPressed;
        });
      }

      animationFrame = requestAnimationFrame(readGamepads);
    };

    readGamepads();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onAction]);
}