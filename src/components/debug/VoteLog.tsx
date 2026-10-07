import { ScoreAction } from '../../types/scoring';

type VoteLogProps = {
  votes: ScoreAction[];
};

export function VoteLog({
  votes,
}: VoteLogProps) {
  return (
    <section
      style={{
        border: '1px solid #ccc',
        padding: 20,
        marginBottom: 30,
      }}
    >
      <h2>Últimos votos</h2>

      {votes.length === 0 && (
        <p>
          Nenhum voto registrado.
        </p>
      )}

      {votes.map(
        (vote, index) => (
          <div
            key={`${vote.timestamp}-${index}`}
            style={{
              padding: '4px 0',
            }}
          >
            J{vote.refereeId}
            {' → '}

            {vote.side === 'BLUE'
              ? 'AZUL'
              : 'VERMELHO'}

            {' +'}

            {vote.points}
          </div>
        ),
      )}
    </section>
  );
}