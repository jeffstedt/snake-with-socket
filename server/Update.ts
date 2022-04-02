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
    case PlayerDirection.Up:
      return { ...accountForTeleportation({ ...position, y: position.y - PLAYER_SIZE }) }
    case PlayerDirection.Down:
      return { ...accountForTeleportation({ ...position, y: position.y + PLAYER_SIZE }) }
    case PlayerDirection.Left:
      return { ...accountForTeleportation({ ...position, x: position.x - PLAYER_SIZE }) }
    case PlayerDirection.Right:
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
  if (newDirection === PlayerDirection.Up && currentDirection !== PlayerDirection.Down) {
    return PlayerDirection.Up
  } else if (newDirection === PlayerDirection.Down && currentDirection !== PlayerDirection.Up) {
    return PlayerDirection.Down
  } else if (newDirection === PlayerDirection.Right && currentDirection !== PlayerDirection.Left) {
    return PlayerDirection.Right
  } else if (newDirection === PlayerDirection.Left && currentDirection !== PlayerDirection.Right) {
    return PlayerDirection.Left
  } else {
    return currentDirection
  }
}

export { updatePoint, updateFruit, updatePlayerPosition, updateTailPositions, updatePlayerDirection }
