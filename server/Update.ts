import { Player, KeyDown, Position, PlayerDirection, Fruit } from '../src/shared-types'
import { canvasSize, playerSize } from './Constants'
import { createFruit } from './Utils'

function updatePoint(player: Player, fruit: Fruit) {
  if (playerIsFruitPosition(player.position, fruit.position)) {
    return player.length + 1
  } else {
    return player.length
  }
}

function updateFruit(player: Player, fruit: Fruit) {
  if (playerIsFruitPosition(player.position, fruit.position)) {
    return createFruit()
  } else {
    return fruit
  }
}

function playerIsFruitPosition(playerPosition: Position, fruitPosition: Position) {
  return playerPosition.x === fruitPosition.x && playerPosition.y === fruitPosition.y
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

function updatePlayerPosition(player: Player, direction: PlayerDirection): Position {
  const position = player.position

  switch (direction) {
    case 'Up':
      return { ...accountForTeleportation({ ...position, y: position.y - playerSize }) }
    case 'Down':
      return { ...accountForTeleportation({ ...position, y: position.y + playerSize }) }
    case 'Left':
      return { ...accountForTeleportation({ ...position, x: position.x - playerSize }) }
    case 'Right':
      return { ...accountForTeleportation({ ...position, x: position.x + playerSize }) }
  }
}

function updateTailPositions(player: Player, fruit: Fruit): Position[] {
  const newPositions = playerIsFruitPosition(player.position, fruit.position)
    ? [...player.positions, player.position]
    : player.positions
  const shiftedPositions = [...newPositions, player.position]
  const [, ...shiftedTails] = shiftedPositions
  return shiftedTails
}

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

export { updatePoint, updateFruit, updatePlayerPosition, updateTailPositions, updatePlayerDirection }
