import { Player } from './shared-types'

interface Props {
  players: Player[]
  socketId: string
}

export default function Leaderboard({ players, socketId }: Props) {
  return (
    <>
      {[...players]
        .sort((a: Player, z: Player) => z.length - a.length)
        .map((player: Player) => (
          <ul key={player.id} style={{ textAlign: 'left' }}>
            <li>
              {player.name}
              {player.id === socketId && ' (You)'}
            </li>
            <li>Points: {player.length}</li>
          </ul>
        ))}
    </>
  )
}
