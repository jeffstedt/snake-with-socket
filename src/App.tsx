import React, { useEffect, useState } from 'react'
import { socket } from './Api'
import { Player, Fruit, EVENT, State, Settings, Color } from './shared-types'
import Canvas from './Canvas'
import SelectScreen from './SelectScreen'

type ServerStatus = {
  state: State | 'Disconnected'
  id: string | null
}

function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ state: State.Disconnected, id: null })
  const [players, setPlayers] = useState<Player[]>([])
  const [fruit, setFruit] = useState<Fruit | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    socket.on(EVENT.CONNECT, () => {
      setServerStatus({ state: State.Loading, id: socket.id })

      // Connect to server
      socket.emit(EVENT.INITIALIZE, { id: socket.id })

      // We have handshake, retrieve game settings
      socket.on(EVENT.START_UP, ({ state, settings }: { state: State; settings: Settings }) => {
        setServerStatus({ state, id: socket.id })
        setSettings(settings)
      })

      // Listen to game updates and save them in our state
      socket.on(
        EVENT.GAME_UPDATE,
        ({ state, players, fruit }: { state: State; players: Player[]; fruit: Fruit }) => {
          setServerStatus({ state, id: socket.id })
          setPlayers(players)
          setFruit(fruit)
        }
      )
    })

    // If we lose connection with server - reset app
    socket.on(EVENT.DISCONNECT, () => {
      setServerStatus({ state: State.Disconnected, id: null })
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

  const applicationIsReady = players.length > 0 && fruit && settings

  return (
    <div className="App">
      <header className="App-header">
        {serverStatus.state === State.Loading || serverStatus.state === State.Init ? (
          'Loading...'
        ) : serverStatus.state === State.Disconnected ? (
          'Disconnected from server'
        ) : settings && serverStatus.state === State.Select ? (
          <SelectScreen settings={settings} startGame={startGame} />
        ) : applicationIsReady && serverStatus.state === State.Playing ? (
          <div>
            <div>
              Players active:
              <div>
                {players.map((player) => (
                  <ul key={player.id} style={{ textAlign: 'left' }}>
                    <li>
                      {player.name}
                      {player.id === serverStatus.id && ' (You)'}
                    </li>
                    <li>Points: {player.length}</li>
                  </ul>
                ))}
              </div>
              <p></p>
            </div>
            <Canvas players={players} fruit={fruit} settings={settings} />
          </div>
        ) : (
          `Error: Unexpected state ${serverStatus.state}`
        )}
      </header>
    </div>
  )
}

export default App
