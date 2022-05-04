import Leaderboard from './Leaderboard'
import { Player, Settings } from 'shared-types'
import { useParams } from 'react-router-dom'

interface Props {
  socketId: string
  settings: Settings
  players: Player[]
  ready: (playerId: string, roomId: string) => void
}

function WaitingRoom({ socketId, settings, players, ready }: Props) {
  const currentRoomId = useParams().id || ''
  return (
    <div className="Ui-wrapper" style={{ height: `${settings.canvasSize}px` }}>
      <div className="Sidebar-wrapper">
        <Leaderboard players={players} socketId={socketId} />
        <button onClick={() => ready(socketId, currentRoomId)}>Ready</button>
      </div>
    </div>
  )
}

export default WaitingRoom
