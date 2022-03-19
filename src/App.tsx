import React, {  useEffect, useState } from 'react'
import { socket } from './Api'
import { Player, Fruit, EVENT, MSG, ServerState, Settings } from "./shared-types"
import Canvas from './Canvas'

type ServerStatus = {
  state: ServerState | 'Disconnected'
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

      // Try to start the game
      socket.emit(MSG.INITIALIZE, {
        id: socket.id,
        // Color could be a fun input before starting the game
        color: '#00FF00',
        position: { x: 250, y: 250 },
      })

      // We have handshake, retrieve game settings
      socket.on(MSG.START_UP, ({ state, settings }) => {
        setServerStatus({ state: state, id: socket.id })
        setSettings(settings)
      })

      // Listen to game updates and save them in our state
      socket.on(EVENT.STATE_UPDATE, ({ state, players, fruit }) => {
        setServerStatus({ state: state, id: socket.id })
        setPlayers(players)
        setFruit(fruit)
      })
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

  const applicationIsReady = players.length > 0 && fruit && settings

  return (
    <div className="App">
      <header className="App-header">
        {serverStatus.state === 'Loading' || serverStatus.state === 'Init' ? (
          'Loading...'
        ) : serverStatus.state === 'Disconnected' ? (
          'Disconnected from server'
        ) : applicationIsReady && serverStatus.state === 'Playing' ? (
          <div>
            <div>
              Players active:
              <div>
                {players.map((player) => (
                  <ul key={player.id} style={{ textAlign: 'left' }}>
                    <li>
                      ID: {player.id}
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
