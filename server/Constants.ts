import { Color } from '../src/shared-types'

const SERVER_PORT = 3001

const enum ENV {
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
}

const TICK_RATE = 15
const TICK_LENGTH_MS = 1000 / TICK_RATE // -> 66ms -> 15 fps

const AREA = 20
const CANVAS_SIZE = 500
const CELL_SIZE = CANVAS_SIZE / AREA
const PLAYER_SIZE = CELL_SIZE

const PLAYER_NAME_MAX_LENGTH = 12

const GAME_SETTINGS = {
  canvasSize: CANVAS_SIZE,
  cellSize: CELL_SIZE,
  color: { red: Color.Red, green: Color.Green, blue: Color.Blue, orange: Color.Orange, purple: Color.Purple },
  playerNameMaxLength: PLAYER_NAME_MAX_LENGTH,
}

export { SERVER_PORT, ENV, TICK_LENGTH_MS, CANVAS_SIZE, CELL_SIZE, PLAYER_SIZE, PLAYER_NAME_MAX_LENGTH, GAME_SETTINGS }
