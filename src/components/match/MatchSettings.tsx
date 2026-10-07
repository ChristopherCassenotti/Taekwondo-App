import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import { FightSettings } from '../../types/settings';

type MatchSettingsProps = {
  value: FightSettings;

  disabled?: boolean;

  onApply: (
    settings: FightSettings,
  ) => void;
};

export function MatchSettings({
  value,
  disabled = false,
  onApply,
}: MatchSettingsProps) {
  const [draft, setDraft] =
    useState<FightSettings>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSubmit = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    onApply(draft);
  };

  return (
    <section
      style={{
        border: '1px solid #ccc',
        padding: 20,
        marginBottom: 30,
      }}
    >
      <h2>Configuração da luta</h2>

      {disabled && (
        <p>
          As configurações ficam bloqueadas
          após o início da luta.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: 12,
          maxWidth: 400,
        }}
      >
        <label>
          Quantidade de rounds
          <br />

          <input
            type="number"
            min={1}
            disabled={disabled}
            value={draft.totalRounds}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,

                totalRounds: Number(
                  event.target.value,
                ),
              }))
            }
          />
        </label>

        <label>
          Duração do round (segundos)
          <br />

          <input
            type="number"
            min={1}
            disabled={disabled}
            value={
              draft.roundDurationSeconds
            }
            onChange={(event) =>
              setDraft((current) => ({
                ...current,

                roundDurationSeconds:
                  Number(
                    event.target.value,
                  ),
              }))
            }
          />
        </label>

        <label>
          Quantidade de árbitros
          <br />

          <input
            type="number"
            min={1}
            max={4}
            disabled={disabled}
            value={draft.refereeCount}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,

                refereeCount: Number(
                  event.target.value,
                ),
              }))
            }
          />
        </label>

        <label>
          Árbitros necessários para
          consenso
          <br />

          <input
            type="number"
            min={1}
            max={draft.refereeCount}
            disabled={disabled}
            value={
              draft.requiredReferees
            }
            onChange={(event) =>
              setDraft((current) => ({
                ...current,

                requiredReferees:
                  Number(
                    event.target.value,
                  ),
              }))
            }
          />
        </label>

        <label>
          Janela de consenso (ms)
          <br />

          <input
            type="number"
            min={100}
            step={50}
            disabled={disabled}
            value={
              draft.consensusWindowMs
            }
            onChange={(event) =>
              setDraft((current) => ({
                ...current,

                consensusWindowMs:
                  Number(
                    event.target.value,
                  ),
              }))
            }
          />
        </label>

        <button
          type="submit"
          disabled={disabled}
        >
          Aplicar configurações
        </button>
      </form>
    </section>
  );
}