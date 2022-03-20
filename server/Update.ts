import { Player, Position, PlayerDirection, Fruit } from '../src/shared-types'
import { CANVAS_SIZE, PLAYER_SIZE } from './Constants'
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
  if (position.y <= 0 - PLAYER_SIZE) {
    return { ...position, y: CANVAS_SIZE - PLAYER_SIZE }
  } else if (position.y >= CANVAS_SIZE) {
    return { ...position, y: 0 }
  } else if (position.x <= 0 - PLAYER_SIZE) {
    return { ...position, x: CANVAS_SIZE - PLAYER_SIZE }
  } else if (position.x >= CANVAS_SIZE) {
    return { ...position, x: 0 }
  } else {
    return position
  }
}

function updatePlayerPosition({ position }: Player, direction: PlayerDirection): Position {
  switch (direction) {
    case PlayerDirection.UP:
      return { ...accountForTeleportation({ ...position, y: position.y - PLAYER_SIZE }) }
    case PlayerDirection.DOWN:
      return { ...accountForTeleportation({ ...position, y: position.y + PLAYER_SIZE }) }
    case PlayerDirection.LEFT:
      return { ...accountForTeleportation({ ...position, x: position.x - PLAYER_SIZE }) }
    case PlayerDirection.RIGHT:
      return { ...accountForTeleportation({ ...position, x: position.x + PLAYER_SIZE }) }
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

function updatePlayerDirection(newDirection: PlayerDirection, currentDirection: PlayerDirection): PlayerDirection {
  if (newDirection === PlayerDirection.UP && currentDirection !== PlayerDirection.DOWN) {
    return PlayerDirection.UP
  } else if (newDirection === PlayerDirection.DOWN && currentDirection !== PlayerDirection.UP) {
    return PlayerDirection.DOWN
  } else if (newDirection === PlayerDirection.RIGHT && currentDirection !== PlayerDirection.LEFT) {
    return PlayerDirection.RIGHT
  } else if (newDirection === PlayerDirection.LEFT && currentDirection !== PlayerDirection.RIGHT) {
    return PlayerDirection.LEFT
  } else {
    return currentDirection
  }
}

export { updatePoint, updateFruit, updatePlayerPosition, updateTailPositions, updatePlayerDirection }
