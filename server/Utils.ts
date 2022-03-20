import { PLAYER_SIZE, CANVAS_SIZE } from './Constants'
import { Model, PlayerDirection, Fruit, ArrowKey, CharacterKey } from '../src/shared-types'
import { Player } from '../src/shared-types'

const avalaibleDirections: PlayerDirection[] = [
  PlayerDirection.UP,
  PlayerDirection.RIGHT,
  PlayerDirection.LEFT,
  PlayerDirection.DOWN,
]

const defaultModel = (): Model => ({
  state: 'Loading',
  players: [],
  fruit: createFruit(),
})

const createPlayer = (id: string, color: string): Player => ({
  id,
  color,
  size: PLAYER_SIZE,
  length: 1,
  position: { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
  positions: [],
  direction: avalaibleDirections.sort(() => Math.random() - 0.5)[0],
})

const createFruit = (): Fruit => ({
  color: '#FF0000',
  size: PLAYER_SIZE,
  position: { x: randomNum(), y: randomNum() },
})

const randomNum = () => Math.floor(Math.random() * 20) * 25

function hourTimeMs() {
  let time = process.hrtime()
  return time[0] * 1000 + time[1] / 1000000
}

function parseKeyDown(keyDown: string): PlayerDirection | 'ILLIGAL_KEY' {
  switch (keyDown) {
    case ArrowKey.ARROWUP:
    case CharacterKey.W:
      return PlayerDirection.UP
    case ArrowKey.ARROWDOWN:
    case CharacterKey.S:
      return PlayerDirection.DOWN
    case ArrowKey.ARROWRIGHT:
    case CharacterKey.D:
      return PlayerDirection.RIGHT
    case ArrowKey.ARROWLEFT:
    case CharacterKey.A:
      return PlayerDirection.LEFT
    default:
      return 'ILLIGAL_KEY'
  }
}

export { hourTimeMs, createPlayer, randomNum, createFruit, parseKeyDown, defaultModel }
