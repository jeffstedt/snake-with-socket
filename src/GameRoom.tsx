import { socket } from './Api'
import { Player, Fruit, EVENT, State, Settings, Input } from './shared-types'
import Game from './Game'
import { useParams } from 'react-router-dom'
import SelectScreen from './SelectScreen'
import Leaderboard from './Leaderboard'

interface Props {
  input: Input
  setInput: React.Dispatch<React.SetStateAction<Input>>
  socketStatus: State | 'Disconnected'
  socketId: string | null
  players: Player[]
  fruit: Fruit | null
  settings: Settings | null
  ready: (playerId: string, roomId: string) => void
  joinRoom?: (roomId: string, input: Input) => void
}

function GameRoom({ input, setInput, socketStatus, socketId, players, fruit, settings, joinRoom, ready }: Props) {
  const currentRoomId = useParams().id || ''

  function exitGame() {
    socket.emit(EVENT.EXIT_GAME)
  }

  const isConnectedToServer = socketId && settings

  return socketStatus === State.Loading || socketStatus === State.Init ? (
    <div>Loading...</div>
  ) : socketStatus === State.Disconnected ? (
    <div>Disconnected from server</div>
  ) : settings && socketStatus === State.Select ? (
    <SelectScreen settings={settings} roomId={currentRoomId} joinRoom={joinRoom} input={input} setInput={setInput} />
  ) : socketId && currentRoomId && socketStatus === State.WaitingRoom ? (
    <div className="Ui-wrapper" style={{height: `${settings?.canvasSize}px`}}>
      <div className="Sidebar-wrapper">
        {/*
      Todo: Instead of reusing Leaderboard - Create a custom component:
      1. Player1          X
      2. Player2 (You)    Ready
      etc..
      */}
        <Leaderboard players={players} socketId={socketId} />
        <button onClick={() => ready(socketId, currentRoomId)}>Ready</button>
      </div>
    </div>
  ) : isConnectedToServer && fruit ? (
    <Game socketId={socketId} players={players} fruit={fruit} settings={settings} exitGame={exitGame} />
  ) : (
    <div>Error: Unexpected state {socketStatus}</div>
  )
}

export default GameRoom
