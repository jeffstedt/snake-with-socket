import { useEffect, useState } from 'react'
import { Player } from './shared-types'

interface Props {
  players: Player[]
  socketId: string
}

export default function Leaderboard({ players, socketId }: Props) {
  const [scores, setScores] = useState<Player[]>([])

  useEffect(() => {
    // Update players[] sort order by score val z-a

    setScores(players.sort((a: Player, z: Player) => z.length - a.length))
  }, [players])

  return (
    <>
      {scores.map((player: Player) => (
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
