import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { SERVER_PORT, ENV, TICK_LENGTH_MS, CANVAS_SIZE, CELL_SIZE, PLAYER_NAME_MAX_LENGTH } from './Constants'
import { defaultModel, hourTimeMs, createPlayer, createFruit, parseKeyDown, getHHMMSSduration } from './Utils'
import { updatePoints, updateFruit, updatePlayerPosition, updateTailPositions, updatePlayerDirection } from './Update'
import { v4 as randomUUID } from 'uuid'

import {
  Room,
  EVENT,
  Player,
  Rooms,
  PlayerDirection,
  Color,
  State,
  NewPlayerInput,
  CreateRoomInput,
  JoinRoomInput,
  ReadyInput,
} from '../src/shared-types'

process.title = 'snake-with-socket'

const httpServer = createServer()
const io = new Server(httpServer)

let loop = { tick: 0, previousClock: hourTimeMs(), debug: process.env.APP_ENV === ENV.DEVELOPMENT }
let rooms: Room[] = defaultModel()

type Msg =
  | { type: 'Init'; playerId: string }
  | { type: 'NewPlayer'; playerId: string; roomId: string; input: NewPlayerInput }
  | { type: 'NewGame'; playerId: string; roomId: string }
  | { type: 'Playing' }
  | { type: 'Loading' }
  | { type: 'Disconnect'; playerId: string }
  | { type: 'PlayerIsReady'; playerId: string }
  | { type: 'UpdatePlayerDirection'; playerId: string; direction: PlayerDirection }
  | { type: 'UpdatePlayer'; player: Player }
  | { type: 'CheckForCollision'; player: Player }

function getRoom(playerId: UUID): Room | null {
  return null
}

function updateRooms(prevRooms: Room[], msg: Msg) {
  const room = rooms[0] // Todo: How do we determine which room to update?

  // Todo: Instead of iterating all games, we should be able to cherry pick the room we want to update
  rooms = prevRooms.map((existingGame) => (existingGame.roomId === room.roomId ? updateGame(room, msg) : existingGame))
}

function updateGame(room: Room, msg: Msg): Room {
  switch (msg.type) {
    case 'Init':
      return { ...room, state: State.Select }
    case 'NewPlayer':
      return {
        ...room,
        roomId: msg.roomId,
        state: State.WaitingRoom,
        players: room.players.concat(createPlayer(msg.playerId, msg.roomId, msg.input.color, msg.input.name)),
      }
    case 'NewGame':
      return { ...room, roomId: room.roomId, state: State.Playing, fruit: createFruit() }
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
  console.info('New connection established:', socket.id)

  socket.on(EVENT.CREATE_ROOM, (input: CreateRoomInput) => {
    const newRoomId = rooms[0].roomId
    updateRooms(rooms, { type: 'NewPlayer', playerId: socket.id, roomId: newRoomId, input })
    const room = rooms[0]

    io.emit(EVENT.JOIN_ROOM, { state: room.state, roomId: room.roomId, players: room.players })
  })

  socket.on(EVENT.JOIN_ROOM, (input: JoinRoomInput) => {
    // Todo: search for joinRoomId and valdiate before joining
    updateRooms(rooms, { type: 'NewPlayer', playerId: socket.id, roomId: input.roomId, input })
    const room = rooms[0]
    io.emit(EVENT.JOIN_ROOM, { state: room.state, roomId: input.roomId, players: room.players })
  })

  socket.on(EVENT.INITIALIZE, ({ roomId: requestedRoomId }: { roomId: string | null }) => {
    // Client wants to init a new room
    const room = rooms[0]
    updateRooms(rooms, { type: 'Init', playerId: socket.id })

    // Emit that room is ready
    io.emit(EVENT.SELECT_GAME, {
      state: room.state,
      // Should probably more like: findRoomId(roomId) || createNewRoom(randomUUID())
      roomId: requestedRoomId || [].length > 0 || '',
      settings: {
        canvasSize: CANVAS_SIZE,
        cellSize: CELL_SIZE,
        color: { red: Color.Red, green: Color.Green, blue: Color.Blue, orange: Color.Orange, purple: Color.Purple },
        playerNameMaxLength: PLAYER_NAME_MAX_LENGTH,
      },
    })
  })

  socket.on(EVENT.READY, (input: ReadyInput) => {
    updateRooms(rooms, { type: 'PlayerIsReady', playerId: input.playerId })
    console.log(JSON.stringify(rooms, null, 2))
    io.emit(EVENT.JOIN_ROOM, { state: rooms[0].state, roomId: input.roomId, players: rooms[0].players })

    if (rooms[0].players.every((player) => player.ready === true)) {
      updateRooms(rooms, { type: 'NewGame', playerId: socket.id, roomId: input.roomId })
    }

    if (rooms[0].state === State.Playing && rooms[0].players.length >= 1) {
      gameLoop()
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
      loop.debug && console.info('Illigal key')
    }
  })

  socket.on(EVENT.EXIT_GAME, () => {
    // Todo: What should happen? Respawn in same room or send to lobby or throw out of lobby?
    updateRooms(rooms, { type: 'Disconnect', playerId: socket.id })
  })

  socket.on(EVENT.DISCONNECT, () => {
    updateRooms(rooms, { type: 'Disconnect', playerId: socket.id })
  })
})

function gameLoop() {
  const room = rooms[0]
  if (room.state === State.Playing && room.players.length > 0) {
    setTimeout(gameLoop, TICK_LENGTH_MS)
  } else {
    updateRooms(rooms, { type: 'Loading' })
  }

  const nowClock = hourTimeMs()
  const delta = (nowClock - loop.previousClock) / 1000

  // Room updates
  for (let index = 0; index < room.players.length; index++) {
    const player = room.players[index]
    updateRooms(rooms, { type: 'UpdatePlayer', player })
    updateRooms(rooms, { type: 'CheckForCollision', player })
  }

  // Then emit
  io.emit(EVENT.GAME_UPDATE, { state: room.state, players: room.players, fruit: room.fruit })

  if (loop.debug) {
    console.debug(
      JSON.stringify(
        {
          delta,
          tick: loop.tick,
          cpu: process.cpuUsage(),
          upTime: getHHMMSSduration(process.uptime()),
          pid: process.pid,
          rooms,
        },
        null,
        2
      )
    )
  }

  loop.previousClock = nowClock
  loop.tick++
}

console.info('Server now running on port', SERVER_PORT)
httpServer.listen(SERVER_PORT)
