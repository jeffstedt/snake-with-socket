import React, { useEffect, useState } from 'react'
import { socket } from './Api'
import { Player, Fruit, EVENT, MSG, ServerState, Settings, COLOR } from './shared-types'
import Canvas from './Canvas'
import SelectScreen from './SelectScreen'

type ServerStatus = {
  state: ServerState
  id: string | null
}

function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ state: 'Disconnected', id: null })
  const [players, setPlayers] = useState<Player[]>([])
  const [fruit, setFruit] = useState<Fruit | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    socket.on(MSG.CONNECT, () => {
      setServerStatus({ state: 'Loading', id: socket.id })

      // Connect to server
      socket.emit(MSG.INITIALIZE, { id: socket.id })

      // We have handshake, retrieve game settings
      socket.on(MSG.START_UP, ({ state, settings }: { state: ServerState; settings: Settings }) => {
        setServerStatus({ state: state, id: socket.id })
        setSettings(settings)
      })

      // Listen to game updates and save them in our state
      socket.on(
        EVENT.STATE_UPDATE,
        ({ state, players, fruit }: { state: ServerState; players: Player[]; fruit: Fruit }) => {
          setServerStatus({ state: state, id: socket.id })
          setPlayers(players)
          setFruit(fruit)
        }
      )
    })

    // If we lose connection with server - reset app
    socket.on(MSG.DISCONNECT, () => {
      setServerStatus({ state: 'Disconnected', id: null })
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

  function startGame(color: COLOR, nickName: string) {
    // Try to start the game
    socket.emit(MSG.START_GAME, { id: socket.id, color: color, name: nickName })
  }

  const applicationIsReady = players.length > 0 && fruit && settings

  return (
    <div className="App">
      <header className="App-header">
        {serverStatus.state === 'Loading' || serverStatus.state === 'Init' ? (
          'Loading...'
        ) : serverStatus.state === 'Disconnected' ? (
          'Disconnected from server'
        ) : settings && serverStatus.state === 'Select' ? (
          <SelectScreen settings={settings} startGame={startGame} />
        ) : applicationIsReady && serverStatus.state === 'Playing' ? (
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
