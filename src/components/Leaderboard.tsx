import { Player } from 'shared-types'
import hexRgb from 'hex-rgb'

interface Props {
  players: Player[]
  socketId: string
}

export default function Leaderboard({ players, socketId }: Props) {
  return (
    <div className="Leaderboard">
      {[...players]
        .sort((a: Player, z: Player) => z.points - a.points)
        .map((player: Player, index: number) => (
          <div
            className="row"
            key={player.id}
            style={{ backgroundColor: hexRgb(player.color, { format: 'css', alpha: 0.25 }) }}
          >
            <span>
              {index + 1}. {player.name}
              {player.id === socketId && ' (You)'}
            </span>
            <span>{player.points}</span>
          </div>
        ))}
    </div>
  )
}
