import { useEffect, useState } from 'react';

type GamepadInfo = {
  index: number;
  id: string;
  buttons: boolean[];
  axes: number[];
};

export function GamepadDebug() {
  const [gamepads, setGamepads] = useState<GamepadInfo[]>([]);

  useEffect(() => {
    let animationFrame: number;

    const updateGamepads = () => {
      const connectedGamepads = navigator.getGamepads();

      const parsedGamepads: GamepadInfo[] = [];

      for (const gamepad of connectedGamepads) {
        if (!gamepad) continue;

        parsedGamepads.push({
          index: gamepad.index,
          id: gamepad.id,
          buttons: gamepad.buttons.map((button) => button.pressed),
          axes: gamepad.axes.map((axis) => Number(axis.toFixed(2))),
        });
      }

      setGamepads(parsedGamepads);

      animationFrame = requestAnimationFrame(updateGamepads);
    };

    updateGamepads();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (gamepads.length === 0) {
    return (
      <div>
        <h2>Controles</h2>
        <p>Nenhum controle detectado.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Controles detectados</h2>

      {gamepads.map((gamepad) => (
        <div
          key={gamepad.index}
          style={{
            border: '1px solid #ccc',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <strong>Controle {gamepad.index + 1}</strong>

          <p>{gamepad.id}</p>

          <h3>Botões</h3>

          <div>
            {gamepad.buttons.map((pressed, index) => (
              <div key={index}>
                Botão {index}: {pressed ? 'PRESSIONADO' : '-'}
              </div>
            ))}
          </div>

          <h3>Eixos</h3>

          <div>
            {gamepad.axes.map((value, index) => (
              <div key={index}>
                Eixo {index}: {value}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}