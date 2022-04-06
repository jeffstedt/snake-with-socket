import { useEffect, useState } from 'react'
import { socket } from './Api'
import { Player, Fruit, EVENT, State, Settings, Color } from './shared-types'
import Canvas from './Canvas'
import SelectScreen from './SelectScreen'
import Leaderboard from './Leaderboard'

function App() {
  const [socketStatus, setSocketStatus] = useState<State | 'Disconnected'>(State.Disconnected)
  const [socketId, setSocektId] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [fruit, setFruit] = useState<Fruit | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    // Connected to server
    socket.on(EVENT.CONNECT, () => {
      setSocketStatus(State.Loading)
      setSocektId(socket.id)

      // Tell server client is ready
      socket.emit(EVENT.INITIALIZE, { id: socket.id })

      // We have handshake, retrieve game settings and go into select screen
      socket.on(EVENT.SELECT_GAME, ({ state, settings }: { state: State; settings: Settings }) => {
        setSocketStatus(state)
        setSettings(settings)
      })

      // Listen to game updates and save them in our state
      socket.on(EVENT.GAME_UPDATE, ({ state, players, fruit }: { state: State; players: Player[]; fruit: Fruit }) => {
        setSocketStatus(state)
        setPlayers(players)
        setFruit(fruit)
      })
    })

    // If we lose connection with server - reset app
    socket.on(EVENT.DISCONNECT, () => {
      setSocketStatus(State.Disconnected)
      setSocektId(null)
      setPlayers([])
      setFruit(null)
      setSettings(null)
    })

    // Listen and emit keydown events
    window.addEventListener('keydown', (event) => {
      socket.emit(EVENT.DIRECTION_UPDATE, {
        playerId: socket.id,
        keyDown: event.key,
      })
    })
  }, [])

  function startGame(color: Color, nickName: string) {
    // Try to start the game
    socket.emit(EVENT.START_GAME, { id: socket.id, color: color, name: nickName })
  }

  const applicationIsReady = socketStatus === State.Playing && socketId && players.length > 0 && fruit && settings

  return (
    <div className="App">

        {socketStatus === State.Loading || socketStatus === State.Init ? (
          'Loading...'
        ) : socketStatus === State.Disconnected ? (
          'Disconnected from server'
        ) : settings && socketStatus === State.Select ? (
          <SelectScreen settings={settings} startGame={startGame} />
        ) : applicationIsReady ? (
          <div className='Canvas-wrapper'>
            <Leaderboard players={players} socketId={socketId} />
            <Canvas players={players} fruit={fruit} settings={settings} />
          </div>
        ) : (
          `Error: Unexpected state ${socketStatus}`
        )}

    </div>
  )
}

export default App
