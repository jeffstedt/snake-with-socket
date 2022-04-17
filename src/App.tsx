import React, { useEffect, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { socket } from './Api'
import { Player, Fruit, EVENT, State, Settings, Color } from './shared-types'
import SelectScreen from './SelectScreen'
import Game from './Game'

function App() {
  const [socketStatus, setSocketStatus] = useState<State | 'Disconnected'>(State.Disconnected)
  const [socketId, setSocektId] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [fruit, setFruit] = useState<Fruit | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [roomId, setRoomId] = useState<string | null>(useParams().id || null)

  const navigate = useNavigate()
  useEffect(() => navigate(`/${roomId}`), [roomId, navigate])

  useEffect(() => {
    // Connected to server
    socket.on(EVENT.CONNECT, () => {
      setSocketStatus(State.Loading)
      setSocektId(socket.id)

      socket.emit(EVENT.INITIALIZE, { id: socket.id, roomId: roomId })

      // We have handshake, retrieve game settings and go into select screen
      socket.on(
        EVENT.SELECT_GAME,
        ({ state, roomId, settings }: { state: State; roomId: string; settings: Settings }) => {
          setSocketStatus(state)
          setSettings(settings)
          setRoomId(roomId)
        }
      )

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
    socket.emit(EVENT.START_GAME, { id: socket.id, color: color, name: nickName })
  }

  function exitGame() {
    socket.emit(EVENT.EXIT_GAME)
  }

  const applicationIsReady = socketStatus === State.Playing && socketId && players.length > 0 && fruit && settings

  return (
    <div className="App">
      {!roomId ? (
        'Connecting...'
      ) : socketStatus === State.Loading || socketStatus === State.Init ? (
        'Loading...'
      ) : socketStatus === State.Disconnected ? (
        'Disconnected from server'
      ) : settings && socketStatus === State.Select ? (
        <SelectScreen settings={settings} startGame={startGame} />
      ) : applicationIsReady ? (
        <Game socketId={socketId} players={players} fruit={fruit} settings={settings} exitGame={exitGame} />
      ) : (
        `Error: Unexpected state ${socketStatus}`
      )}
    </div>
  )
}

export default App
