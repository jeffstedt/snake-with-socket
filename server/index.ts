import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { SERVER_PORT, ENV, TICK_LENGTH_MS, GAME_SETTINGS } from './Constants'
import { defaultModel, hourTimeMs, createPlayer, createFruit, parseKeyDown, getHHMMSSduration } from './Utils'
import { updatePoints, updateFruit, updatePlayerPosition, updateTailPositions, updatePlayerDirection } from './Update'

import {
  Room,
  EVENT,
  Player,
  PlayerDirection,
  State,
  NewPlayerInput,
  CreateRoomInput,
  JoinRoomInput,
  ReadyInput,
} from '../src/shared-types'

process.title = 'snake-with-socket'

const httpServer = createServer()
const io = new Server(httpServer)

let debug = { log: true, tickCount: 0, previousClock: hourTimeMs(), env: process.env.APP_ENV === ENV.DEVELOPMENT }
let rooms: Room[] = defaultModel()

type Msg =
  | { type: 'InitSelectScreen'; playerId: string }
  | { type: 'NewPlayer'; playerId: string; roomId: string; input: NewPlayerInput }
  | { type: 'StartGame'; playerId: string; roomId: string }
  | { type: 'Playing' }
  | { type: 'Loading' }
  | { type: 'Disconnect'; playerId: string }
  | { type: 'PlayerIsReady'; playerId: string }
  | { type: 'UpdatePlayerDirection'; playerId: string; direction: PlayerDirection }
  | { type: 'UpdatePlayer'; player: Player }
  | { type: 'CheckForCollision'; player: Player }

function getRoom(rooms: Room[], playerId: UUID): Room | null {
  return rooms.find((room) => room.players.some((player) => player.id === playerId)) || null
}

function updateRooms(prevRooms: Room[], msg: Msg) {
  const room = rooms[0]

  // Todo: Instead of iterating all games, we should be able to cherry pick the room we want to update
  rooms = prevRooms.map((existingRoom) => (existingRoom.id === room.id ? updateRoom(room, msg) : existingRoom))
}

function updateRoom(room: Room, msg: Msg): Room {
  switch (msg.type) {
    case 'InitSelectScreen':
      return { ...room, state: State.Select }
    case 'NewPlayer':
      return {
        ...room,
        id: msg.roomId,
        state: State.WaitingRoom,
        players: room.players.concat(createPlayer(msg.playerId, msg.roomId, msg.input.color, msg.input.name)),
      }
    case 'StartGame':
      return { ...room, id: room.id, state: State.Playing, fruit: createFruit() }
    case 'Playing':
      return { ...room, state: State.Playing }
    case 'Disconnect':
      return {
        ...room,
        state: State.Select,
        players: room.players.filter((player) => player.id !== msg.playerId),
      }
    case 'UpdatePlayerDirection':
      return {
        ...room,
        state: State.Playing,
        players: room.players.map((player) =>
          player.id === msg.playerId
            ? {
                ...player,
                direction: updatePlayerDirection(msg.direction, player.direction),
              }
            : player
        ),
      }
    case 'PlayerIsReady':
      return {
        ...room,
        state: State.WaitingRoom,
        players: room.players.map((player) =>
          player.id === msg.playerId
            ? {
                ...player,
                ready: !player.ready,
              }
            : player
        ),
      }
    case 'UpdatePlayer':
      return {
        ...room,
        state: State.Playing,
        players: room.players.map((player) =>
          player.id === msg.player.id
            ? {
                ...player,
                position: updatePlayerPosition(player.position, player.direction),
                positions: updateTailPositions(player, room.fruit),
                points: updatePoints(player, room.fruit),
              }
            : player
        ),
        fruit: updateFruit(msg.player, room.fruit),
      }
    case 'CheckForCollision':
      if (
        msg.player.positions.some(
          (tailCell) => tailCell.x === msg.player.position.x && tailCell.y === msg.player.position.y
        )
      ) {
        return {
          ...room,
          state: State.Playing,
          players: [createPlayer(msg.player.id, msg.player.roomId, msg.player.color, msg.player.name)],
          fruit: createFruit(),
        }
      } else {
        return room
      }
    case 'Loading':
      return { ...room, state: State.Loading }
    default:
      return room
  }
}

// Server Logic
io.sockets.on(EVENT.CONNECT, (socket: Socket) => {
  const clientId = socket.id
  log({ message: 'New client connected:', clientId })

  // First thing: Emit game settings
  io.emit(EVENT.GAME_SETTINGS, { settings: GAME_SETTINGS })

  socket.on(EVENT.CREATE_ROOM, (input: CreateRoomInput) => {
    const newRoomId = rooms[0].id
    updateRooms(rooms, { type: 'NewPlayer', playerId: clientId, roomId: newRoomId, input })
    const room = rooms[0]

    io.emit(EVENT.JOIN_ROOM, { state: room.state, roomId: room.id, players: room.players })
  })

  socket.on(EVENT.JOIN_ROOM, (input: JoinRoomInput) => {
    // Todo: search for joinRoomId and valdiate before joining
    updateRooms(rooms, { type: 'NewPlayer', playerId: clientId, roomId: input.roomId, input })
    const room = rooms[0]
    io.emit(EVENT.JOIN_ROOM, { state: room.state, roomId: input.roomId, players: room.players })
  })

  socket.on(EVENT.INIT_SELECT_SCREEN, ({ roomId: requestedRoomId }: { roomId: string | null }) => {
    // Client wants to either create room or join one
    const room = getRoom(rooms, clientId)
    const roomIsPlaying = room?.state === State.Playing
    const roomExists = rooms.some((room) => room.id === requestedRoomId)
    const requestedRoomIsAvailable = room && roomExists && !roomIsPlaying

    updateRooms(rooms, { type: 'InitSelectScreen', playerId: clientId })

    // Todo: Client doesnt respect our payload
    if (requestedRoomIsAvailable) {
      // Put player in select screen with the option to JOIN ROOM
      io.emit(EVENT.SELECT_SCREEN, { state: room.state, roomId: requestedRoomId })
    } else {
      // Put player in select screen with the option to CREATE ROOM
      io.emit(EVENT.SELECT_SCREEN, { state: State.Select, roomId: null })
    }
  })

  socket.on(EVENT.PLAYER_READY, (input: ReadyInput) => {
    updateRooms(rooms, { type: 'PlayerIsReady', playerId: input.playerId })
    log(rooms)

    io.emit(EVENT.JOIN_ROOM, { state: rooms[0].state, roomId: input.roomId, players: rooms[0].players })

    if (rooms[0].players.every((player) => player.ready === true)) {
      updateRooms(rooms, { type: 'StartGame', playerId: clientId, roomId: input.roomId })
    }

    if (rooms[0].state === State.Playing && rooms[0].players.length >= 1) {
      tick()
    } else {
      updateRooms(rooms, { type: 'Loading' })
    }
  })

  socket.on(EVENT.DIRECTION_UPDATE, ({ playerId, keyDown }: { playerId: string; keyDown: string }) => {
    const room = rooms[0]
    if (room.state !== State.Playing) {
      return
    }

    const parsedKeyDown = parseKeyDown(keyDown.toUpperCase())
    if (parsedKeyDown !== 'ILLIGAL_KEY') {
      updateRooms(rooms, { type: 'UpdatePlayerDirection', playerId: playerId, direction: parsedKeyDown })
    } else {
      log({ message: 'Illigal key' })
    }
  })

  socket.on(EVENT.EXIT_GAME, () => {
    // Todo: What should happen? Respawn in same room or send to lobby or throw out of lobby?
    updateRooms(rooms, { type: 'Disconnect', playerId: clientId })
  })

  socket.on(EVENT.DISCONNECT, () => {
    updateRooms(rooms, { type: 'Disconnect', playerId: clientId })
  })
})

function tick() {
  const room = rooms[0]
  if (room.state === State.Playing && room.players.length > 0) {
    setTimeout(tick, TICK_LENGTH_MS)
  } else {
    updateRooms(rooms, { type: 'Loading' })
  }

  const nowClock = hourTimeMs()
  const delta = (nowClock - debug.previousClock) / 1000

  // Room updates
  for (let index = 0; index < room.players.length; index++) {
    const player = room.players[index]
    updateRooms(rooms, { type: 'UpdatePlayer', player })
    updateRooms(rooms, { type: 'CheckForCollision', player })
  }

  // Then emit
  io.emit(EVENT.GAME_UPDATE, { state: room.state, players: room.players, fruit: room.fruit })

  log({
    delta,
    tickCount: debug.tickCount,
    cpu: process.cpuUsage(),
    upTime: getHHMMSSduration(process.uptime()),
    pid: process.pid,
    rooms,
  })

  debug.previousClock = nowClock
  debug.tickCount++
}

const log = (object: Object) => debug.log && console.debug(JSON.stringify(object, null, 2))

console.info('Server now running on port', SERVER_PORT)
httpServer.listen(SERVER_PORT)
