import { useEffect, useState } from 'react'
import { EVENT, MSG, socket } from './Api'
import Canvas, { ServerState, Player, Fruit, Settings } from './Canvas'


type ServerStatus = {
  state: ServerState | "Disconnected"
  id: string | null
}

function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({state: "Disconnected", id: null })
  const [players, setPlayers] = useState<Player[]>([])
  const [fruit, setFruit] = useState<Fruit | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    socket.on(MSG.CONNECT, () => {
      setServerStatus({state: "Loading", id: socket.id})

      // Try to start the game
      socket.emit(MSG.INITIALIZE, {
        id: socket.id,
        // Color could be a fun input before starting the game
        color: '#00FF00',
        position: { x: 250, y: 250 },
      })

      // Listen and emit keydown events
      window.addEventListener('keydown', (event) => {
        socket.emit(EVENT.DIRECTION_UPDATE, {
          playerId: socket.id,
          keyDown: event.key,
        })
      })

      // Listen to game updates and save them in our state
      socket.on(EVENT.STATE_UPDATE, ({ state, players, fruit, settings }) => {
        setServerStatus({state: state, id: socket.id})
        setPlayers(players)
        setFruit(fruit)
        setSettings(settings)
      })
    })

    socket.on(MSG.DISCONNECT, () => {
      setServerStatus({state: "Disconnected", id: null})
      setPlayers([])
      setFruit(null)
    })
  }, [])

  const applicationIsReady = players.length > 0 && fruit && settings

  return (
    <div className="App">
      <header className="App-header">
        {serverStatus.state === 'Loading' ? (
          'Waiting on server...'
        ): serverStatus.state === 'Disconnected' ? (
          'Disconnected from server'
        ) : (
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
            {applicationIsReady && serverStatus.state === 'Playing' ? (
              <Canvas players={players} fruit={fruit} settings={settings} />
            ) : (
              'Loading...'
            )}
          </div>
        )}
      </header>
    </div>
  )
}

export default App
