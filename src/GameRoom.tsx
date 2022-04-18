import { socket } from './Api'
import { Player, Fruit, EVENT, State, Settings, Color } from './shared-types'
import Game from './Game'
import { useParams } from 'react-router-dom'
import SelectScreen, { Input } from './SelectScreen'
import Leaderboard from './Leaderboard'

interface Props {
  socketStatus: State | 'Disconnected'
  socketId: string | null
  players: Player[]
  fruit: Fruit | null
  settings: Settings | null
  startGame: (color: Color, name: string) => void
  input: Input
  setInput: React.Dispatch<React.SetStateAction<Input>>
}

function GameRoom({ socketStatus, socketId, players, fruit, settings, startGame, input, setInput }: Props) {
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
    <SelectScreen settings={settings} roomId={currentRoomId} startGame={startGame} input={input} setInput={setInput} />
  ) : socketStatus === State.WaitingRoom ? (
    <div className="Sidebar-wrapper">
      {/*
      Todo: Instead of reusing Leaderboard - Create a custom component:
      1. Player1    X
      2. Player1    Ready
      etc..
      */}
      <Leaderboard players={players} socketId={socketId || ''} />
      <button onClick={() => startGame(input.color || Color.Blue, input.name)}>Ready</button>
    </div>
  ) : isConnectedToServer && fruit ? (
    <Game socketId={socketId} players={players} fruit={fruit} settings={settings} exitGame={exitGame} />
  ) : (
    <div>Error: Unexpected state {socketStatus}</div>
  )
}

export default GameRoom
