import { playerSize, canvasSize } from './Constants'
import { Fruit } from '../src/shared-types'

function hourTimeMs() {
  let time = process.hrtime()
  return time[0] * 1000 + time[1] / 1000000
}

const createPlayer = (id: string, color: string) => ({
  id,
  color,
  size: playerSize,
  length: 1,
  position: { x: canvasSize / 2, y: canvasSize / 2 },
  positions: [],
  direction: ['Up', 'Right', 'Left', 'Down'].sort(() => Math.random() - 0.5)[0],
})

const randomNum = () => Math.floor(Math.random() * 20) * 25

const createFruit = (): Fruit => ({
  color: '#FF0000',
  size: playerSize,
  position: { x: randomNum(), y: randomNum() },
})

export { hourTimeMs, createPlayer, randomNum, createFruit }
