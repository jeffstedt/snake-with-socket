import { createServer } from 'http'
import { Children } from 'react'
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
        players: model.players?.filter((player) => player.id === msg.socketId) || [],
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
                  prevPosition: getPlayerHead(player.position), // Should be more dynamic..
                  position: [updatePlayerPosition(player, player.direction)],
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
                  position: [...player.position, ...addFakeFollower(player)],
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

    if (model.players?.length === 1 && model.state === 'Playing') {
      gameLoop()
    } else {
      updateModel(model, { type: 'Loading' })
    }
  })

  socket.on(EVENT.DIRECTION_UPDATE, ({ playerId, keyDown }: { playerId: string; keyDown: string }) => {
    // Client wants to update the position
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
  io.emit(EVENT.STATE_UPDATE, {
    state: model.state,
    players: model.players,
    fruit: model.fruit,
    settings: { cellSize },
  })
  console.log(JSON.stringify({ delta, tick, model }, null, 2))

  previous = now
  tick++
}

function updatePoint(player: Player, fruit?: Fruit) {
  const playerPosition = getPlayerHead(player.position)
  if (playerIsFruitPosition(playerPosition, fruit?.position)) {
    return player.length + 1
  } else {
    return player.length
  }
}

function updateFruit(player: Player, fruit?: Fruit) {
  const playerPosition = getPlayerHead(player.position)
  if (playerIsFruitPosition(playerPosition, fruit?.position)) {
    return createFruit()
  } else {
    return fruit
  }
}

function accountForTeleportation(position: Position) {
  if (position.y <= 0 - playerSize) {
    return { ...position, y: canvasSize - playerSize }
  } else if (position.y >= canvasSize) {
    return { ...position, y: 0 }
  } else if (position.x <= 0 - playerSize) {
    return { ...position, x: canvasSize - playerSize }
  } else if (position.x >= canvasSize) {
    return { ...position, x: 0 }
  } else {
    return position
  }
}

function addFakeFollower(player: Player) {
  const position = player.prevPosition
  let chidlren = []
  for (let index = 0; index < player.length; index++) {
    chidlren.push({ x: position.x, y: position.y })
  }
  return chidlren
}

function updatePlayerPosition(player: Player, direction: PlayerDirection): Position {
  const position = getPlayerHead(player.position)

  switch (direction) {
    case 'Up':
      return accountForTeleportation({ ...position, y: position.y - playerSize })
    case 'Down':
      return accountForTeleportation({ ...position, y: position.y + playerSize })
    case 'Left':
      return accountForTeleportation({ ...position, x: position.x - playerSize })
    case 'Right':
      return accountForTeleportation({ ...position, x: position.x + playerSize })
  }
}

// Utills

function playerIsFruitPosition(playerPosition: Position, fruitPosition?: Position) {
  return playerPosition.x === fruitPosition?.x && playerPosition?.y === fruitPosition.y
}

function getPlayerHead(position: Position[]) {
  return position[0]
}

function getPlayerTail(position: Position[]) {
  return position[position.length - 1]
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
  position: [{ x: canvasSize / 2, y: canvasSize / 2 }],
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
