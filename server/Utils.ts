import { PLAYER_SIZE, CANVAS_SIZE } from './Constants'
import { Model, PlayerDirection, Fruit, ArrowKey, CharacterKey, Color, State } from '../src/shared-types'
import { Player } from '../src/shared-types'

const avalaibleDirections: PlayerDirection[] = [
  PlayerDirection.Up,
  PlayerDirection.Right,
  PlayerDirection.Left,
  PlayerDirection.Down,
]

const defaultModel = (): Model => ({
  state: State.Loading,
  players: [],
  fruit: createFruit(),
})

const createPlayer = (id: string, color: Color, name: string): Player => ({
  id,
  name: formatPlayerName(name),
  color,
  size: PLAYER_SIZE,
  length: 1,
  position: { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
  positions: [],
  direction: avalaibleDirections.sort(() => Math.random() - 0.5)[0],
})

const createFruit = (): Fruit => ({
  color: Color.Red,
  size: PLAYER_SIZE,
  position: { x: randomNum(), y: randomNum() },
})

const randomNum = () => Math.floor(Math.random() * 20) * 25

function formatPlayerName(name: string) {
  const [firstChar, ...rest] = name.split('')
  return firstChar.toUpperCase() + rest.join('')
}

function hourTimeMs() {
  const [seconds, nanoseconds] = process.hrtime()
  return seconds * 1000 + nanoseconds / 1000000
}

function parseKeyDown(keyDown: string): PlayerDirection | 'ILLIGAL_KEY' {
  switch (keyDown) {
    case ArrowKey.ArrowUp:
    case CharacterKey.W:
      return PlayerDirection.Up
    case ArrowKey.ArrowDown:
    case CharacterKey.S:
      return PlayerDirection.Down
    case ArrowKey.ArrowRight:
    case CharacterKey.D:
      return PlayerDirection.Right
    case ArrowKey.ArrowLeft:
    case CharacterKey.A:
      return PlayerDirection.Left
    default:
      return 'ILLIGAL_KEY'
  }
}

const botPlayer = createPlayer('0', Color.Purple, 'Bot')

export { hourTimeMs, createPlayer, randomNum, createFruit, parseKeyDown, defaultModel, botPlayer }
