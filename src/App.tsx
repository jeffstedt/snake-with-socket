import { useEffect, useState } from 'react'
import { socket } from './Api'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SelectScreen from 'components/SelectScreen'
import Game from 'components/Game'
import WaitingRoom from 'components/WaitingRoom'
import Logo from 'components/Logo'

import {
  Player,
  Fruit,
  EVENT,
  State,
  Settings,
  Input,
  JoinRoomInput,
  CreateRoomInput,
  Color,
  ReadyInput,
  ArrowKey,
  CharacterKey,
} from 'shared-types'
import Loading from 'components/Loading'

function App() {
  const defaultColor = Color.Green
  const [socketStatus, setSocketStatus] = useState<State | 'Disconnected'>(State.Disconnected)
  const [socketId, setSocektId] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [fruit, setFruit] = useState<Fruit | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [roomId, setRoomId] = useState<string | undefined>(undefined)
  const [input, setInput] = useState<Input>({ color: defaultColor, name: '' })

  useEffect(() => {
    // Connected to server
    socket.on(EVENT.CONNECT, () => {
      setSocketStatus(State.Loading)
      setSocektId(socket.id)

      socket.on(EVENT.GAME_SETTINGS, ({ settings }: { settings: Settings }) => setSettings(settings))

      // We have handshake, retrieve game settings and go into select screen
      socket.on(EVENT.SELECT_SCREEN, ({ state, roomId }: { state: State; roomId: UUID }) => {
        setSocketStatus(state)
        setRoomId(roomId)
      })

      // Listen to game updates and save them in our state
      socket.on(EVENT.GAME_UPDATE, ({ state, players, fruit }: { state: State; players: Player[]; fruit: Fruit }) => {
        setSocketStatus(state)
        setPlayers(players)
        setFruit(fruit)
      })
    })

    // Server assignes us a room
    socket.on(EVENT.JOIN_ROOM, ({ state, roomId, players }) => {
      setSocketStatus(state)
      setRoomId(roomId)
      setPlayers(players)
    })

    // If we lose connection with server - reset app
    socket.on(EVENT.DISCONNECT, () => {
      setSocketStatus(State.Disconnected)
      setSocektId(null)
      setPlayers([])
      setFruit(null)
      setSettings(null)
    })
  }, [])

  useEffect(() => {
    // Listen and emit accepted keydown events
    window.addEventListener('keydown', (event) => {
      const keyDown = event.key.toUpperCase()
      if (acceptedKeys(keyDown)) {
        socket.emit(EVENT.DIRECTION_UPDATE, { playerId: socket.id, keyDown })
      }
    })
  }, [])

  function acceptedKeys(key: string) {
    const acceptedArrowKeys = [ArrowKey.ArrowUp, ArrowKey.ArrowLeft, ArrowKey.ArrowRight, ArrowKey.ArrowUp]
    const acceptedCharacterKeys = [CharacterKey.W, CharacterKey.A, CharacterKey.S, CharacterKey.D]
    return [...acceptedArrowKeys, ...acceptedCharacterKeys].map((x) => x.toString()).includes(key)
  }

  function createRoom({ color, name }: Input) {
    const payload: CreateRoomInput = { playerId: socket.id, color: color || defaultColor, name }
    socket.emit(EVENT.CREATE_ROOM, payload)
  }

  function joinRoom(roomId: UUID, { color, name }: Input) {
    const payload: JoinRoomInput = { roomId, playerId: socket.id, color: color || defaultColor, name }
    socket.emit(EVENT.JOIN_ROOM, payload)
  }

  function ready(playerId: UUID, roomId: UUID) {
    const payload: ReadyInput = { playerId, roomId }
    socket.emit(EVENT.PLAYER_READY, payload)
  }

  function exitGame() {
    socket.emit(EVENT.EXIT_GAME)
  }

  function askForSelectScreen(roomId: UUID | null) {
    socket.emit(EVENT.INIT_SELECT_SCREEN, { roomId })
  }

  // Early exit if disconnected
  if (socketStatus === State.Disconnected) {
    return (
      <div className="App">
        <div>Disconnected from server</div>
      </div>
    )
  }

  // Wait on settings...
  if (!settings || !socketId) {
    return (
      <div className="App">
        <div>Retriving settings...</div>
      </div>
    )
  }

  return (
    <div className="App">
      {<Logo settings={settings} color={input.color} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loading askForSelectScreen={askForSelectScreen} roomId={roomId} />} />
          <Route path="/:requestedId" element={<Loading askForSelectScreen={askForSelectScreen} roomId={roomId} />} />
          <Route
            path="/game/:id"
            element={
              socketStatus === State.Loading ? (
                <Loading askForSelectScreen={askForSelectScreen} roomId={roomId} />
              ) : socketStatus === State.Select ? (
                <SelectScreen input={input} setInput={setInput} settings={settings} joinRoom={joinRoom} />
              ) : socketStatus === State.WaitingRoom ? (
                <WaitingRoom socketId={socketId} settings={settings} players={players} ready={ready} />
              ) : State.Playing ? (
                <Game socketId={socketId} settings={settings} players={players} fruit={fruit} exitGame={exitGame} />
              ) : (
                <div>Error: Unexpected id: {roomId}</div>
              )
            }
          />
          <Route
            path="/new-game"
            element={
              State.Select ? (
                <SelectScreen
                  input={input}
                  setInput={setInput}
                  settings={settings}
                  roomId={roomId}
                  createRoom={createRoom}
                />
              ) : (
                <Loading askForSelectScreen={askForSelectScreen} roomId={roomId} />
              )
            }
          />
          <Route path="/*" element={<div>404, could not find page</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
