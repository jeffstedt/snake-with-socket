import { Model } from './Interface'
import { createFruit } from './Utils'

const TICK_RATE = 10
const tickLengthMs = 1000 / TICK_RATE // -> 100ms -> 10 fps

const area = 20
const canvasSize = 500
const cellSize = canvasSize / area
const playerSize = cellSize

const defaultModel = (): Model => ({
  state: 'Loading',
  players: [],
  fruit: createFruit(),
})

export { tickLengthMs, canvasSize, cellSize, playerSize, defaultModel }
