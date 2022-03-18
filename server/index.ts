import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { EVENT, MSG, Player, KeyDown, Model, Position, PlayerDirection, Fruit } from './Interface'

const httpServer = createServer()
const io = new Server(httpServer)

const TICK_RATE = 10

let tick = 0
let previous = hrtimeMs()
let tickLengthMs = 1000 / TICK_RATE

const canvasSize = 500
const cellSize = 25
const playerSize = cellSize

const defaultModel = (): Model => ({
  state: 'Loading',
  players: [],
})

let model: Model = {
  state: 'Init',
  players: [],
}

type Msg =
  | { type: 'Init'; socketId: string; player: Player }
  | { type: 'Playing' }
  | { type: 'Loading' }
  | { type: 'Disconnect'; socketId: string }
  | { type: 'NewDirection'; playerId: string; keyDown: KeyDown }
  | { type: 'UpdatePlayer'; player: Player }
  | { type: 'UpdateFruit'; player: Player }
  | { type: 'UpdatePlayerLength'; player: Player }
  | { type: 'AddPoint'; player: Player }

function updateModel(prevModel: Model, msg: Msg) {
  switch (msg.type) {
    case 'Init':
      model = {
        ...prevModel,
        state: 'Playing',
        players: [createPlayer(msg.socketId, msg.player.color)],
        fruit: createFruit(),
      }
      break
    case 'Playing':
      model = { ...prevModel, state: 'Playing' }
      break
    case 'Disconnect':
      model = {
        ...prevModel,
        state: 'Loading',
        players: model.players?.filter((player) => player.id !== msg.socketId) || [],
      }
      break
    case 'NewDirection':
      model = {
        ...prevModel,
        state: 'Playing',
        players:
          model.players?.map((player) =>
            player.id === msg.playerId
              ? {
                  ...player,
                  direction: updatePlayerDirection(msg.keyDown, player.direction),
                }
              : player
          ) || [],
      }
      break
    case 'UpdatePlayer':
      model = {
        ...prevModel,
        state: 'Playing',
        players:
          model.players?.map((player) =>
            player.id === msg.player.id
              ? {
                  ...player,
                  prevPosition: getPlayerHead(player.positions), // Should be more dynamic..
                  positions: [updatePlayerPosition(player, player.direction)],
                  length: updatePoint(player, model.fruit),
                }
              : player
          ) || [],
      }
      break
    case 'UpdateFruit':
      model = {
        ...prevModel,
        state: 'Playing',
        fruit: updateFruit(msg.player, model.fruit),
      }
      break
    case 'UpdatePlayerLength':
      model = {
        ...prevModel,
        state: 'Playing',
        players:
          model.players?.map((player) =>
            player.id === msg.player.id
              ? {
                  ...player,
                  positions: [...player.positions, ...addFakeFollower(player)],
                }
              : player
          ) || [],
      }
      break
    case 'Loading':
      model = { ...prevModel, ...defaultModel() }
      break
    default:
      model = prevModel
      break
  }
}

// Server Logic
io.sockets.on(MSG.CONNECT, (socket: Socket) => {
  console.log('New connection established:', socket.id)

  socket.on(MSG.INITIALIZE, (player: Player) => {
    // Client wants to start a new game
    updateModel(model, { type: 'Init', socketId: socket.id, player })

    // Before starting game, give client game settings
    io.emit(MSG.START_UP, { state: model.state, settings: { canvasSize, cellSize } })

    if (model.players?.length === 1 && model.state === 'Playing') {
      gameLoop()
    } else {
      updateModel(model, { type: 'Loading' })
    }
  })

  socket.on(EVENT.DIRECTION_UPDATE, ({ playerId, keyDown }: { playerId: string; keyDown: string }) => {
    // Client wants to update the positions
    const allowedKeyEvents =
      keyDown === 'ArrowUp' || keyDown === 'ArrowDown' || keyDown === 'ArrowRight' || keyDown === 'ArrowLeft'

    if (allowedKeyEvents) {
      //  This happens outside the game loop, is it a problem?
      updateModel(model, { type: 'NewDirection', playerId: playerId, keyDown })
    }
  })

  socket.on(MSG.DISCONNECT, () => {
    updateModel(model, { type: 'Disconnect', socketId: socket.id })
  })
})

function gameLoop() {
  if (model.state === 'Playing' && model.players && model.players.length > 0) {
    setTimeout(gameLoop, tickLengthMs)
  } else {
    updateModel(model, { type: 'Loading' })
  }

  let now = hrtimeMs()
  let delta = (now - previous) / 1000

  // Update
  if (model.players)
    for (let index = 0; index < model.players.length; index++) {
      const player = model.players[index]
      updateModel(model, { type: 'UpdatePlayer', player: player })
      updateModel(model, { type: 'UpdateFruit', player: player })
      updateModel(model, { type: 'UpdatePlayerLength', player: player })
    }

  // Then emit
  io.emit(EVENT.STATE_UPDATE, { state: model.state, players: model.players, fruit: model.fruit })
  console.log(JSON.stringify({ delta, tick, model }, null, 2))

  previous = now
  tick++
}

function updatePoint(player: Player, fruit?: Fruit) {
  const playerPosition = getPlayerHead(player.positions)
  if (playerIsFruitPosition(playerPosition, fruit?.position)) {
    return player.length + 1
  } else {
    return player.length
  }
}

function updateFruit(player: Player, fruit?: Fruit) {
  const playerPosition = getPlayerHead(player.positions)
  if (playerIsFruitPosition(playerPosition, fruit?.position)) {
    return createFruit()
  } else {
    return fruit
  }
}

function accountForTeleportation(positions: Position) {
  if (positions.y <= 0 - playerSize) {
    return { ...positions, y: canvasSize - playerSize }
  } else if (positions.y >= canvasSize) {
    return { ...positions, y: 0 }
  } else if (positions.x <= 0 - playerSize) {
    return { ...positions, x: canvasSize - playerSize }
  } else if (positions.x >= canvasSize) {
    return { ...positions, x: 0 }
  } else {
    return positions
  }
}

function addFakeFollower(player: Player) {
  const positions = player.prevPosition
  let chidlren = []
  for (let index = 0; index < player.length; index++) {
    chidlren.push({ x: positions.x, y: positions.y })
  }
  return chidlren
}

function updatePlayerPosition(player: Player, direction: PlayerDirection): Position {
  const positions = getPlayerHead(player.positions)

  switch (direction) {
    case 'Up':
      return accountForTeleportation({ ...positions, y: positions.y - playerSize })
    case 'Down':
      return accountForTeleportation({ ...positions, y: positions.y + playerSize })
    case 'Left':
      return accountForTeleportation({ ...positions, x: positions.x - playerSize })
    case 'Right':
      return accountForTeleportation({ ...positions, x: positions.x + playerSize })
  }
}

// Utills

function playerIsFruitPosition(playerPosition: Position, fruitPosition?: Position) {
  return playerPosition.x === fruitPosition?.x && playerPosition?.y === fruitPosition.y
}

function getPlayerHead(positions: Position[]) {
  return positions[0]
}

function getPlayerTail(positions: Position[]) {
  return positions[positions.length - 1]
}

function hrtimeMs() {
  let time = process.hrtime()
  return time[0] * 1000 + time[1] / 1000000
}

const createPlayer = (id: string, color: string) => ({
  id,
  color,
  size: playerSize,
  length: 1,
  prevPosition: { x: canvasSize / 2, y: canvasSize / 2 },
  positions: [{ x: canvasSize / 2, y: canvasSize / 2 }],
  direction: ['Up', 'Right', 'Left', 'Down'].reduce((p, c, i, array) => {
    return array[Math.floor(Math.random() * Math.floor(array.length))]
  }) as PlayerDirection,
})

const randomNum = () => Math.floor(Math.random() * 20) * 25

const createFruit = () => ({
  color: '#FF0000',
  size: playerSize,
  position: { x: randomNum(), y: randomNum() },
})

function updatePlayerDirection(key: KeyDown, direction: PlayerDirection) {
  if (key === 'ArrowUp' && direction !== 'Down') {
    return 'Up'
  } else if (key === 'ArrowDown' && direction !== 'Up') {
    return 'Down'
  } else if (key === 'ArrowRight' && direction !== 'Left') {
    return 'Right'
  } else if (key === 'ArrowLeft' && direction !== 'Right') {
    return 'Left'
  } else {
    return direction
  }
}

console.log('Server now running on port', 3001)
httpServer.listen(3001)
