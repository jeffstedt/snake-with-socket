import { useRef, useEffect } from 'react'
import { Player, Fruit, Settings } from './shared-types'

type Context = CanvasRenderingContext2D

interface Props {
  players: Player[]
  fruit: Fruit
  settings: Settings
}

export default function Canvas({ players, fruit, settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { canvasSize, cellSize } = settings

  function drawSnake(context: Context, player: Player) {
    const cells = [player.position, ...player.positions]
    for (const cell of cells) {
      context.fillStyle = player.color
      context.fillRect(cell.x, cell.y, player.size, player.size)
    }

  }

  function drawFruit(context: Context, fruit: Fruit) {
    context.beginPath()
    context.fillStyle = fruit.color
    context.arc(fruit.size / 2 + fruit.position.x, fruit.position.y + fruit.size / 2, fruit.size / 2, 0, 2 * Math.PI)
    context.fill()
  }

  function draw(context: Context) {
    // Draw play board
    context.fillStyle = '#1a1a1c'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    // Draw grid
    for (let index = 0; index <= context.canvas.width; index += cellSize) {
      context.moveTo(0.5 + index, 0)
      context.lineTo(0.5 + index, context.canvas.height)
    }

    for (let index = 0; index <= context.canvas.height; index += cellSize) {
      context.moveTo(0, 0.5 + index)
      context.lineTo(context.canvas.width, 0.5 + index)
    }

    context.strokeStyle = '#24272d'
    context.stroke()

    // Draw fruit
    if (fruit) {
      drawFruit(context, fruit)
    }

    // Draw players
    for (const player of players) {
      drawSnake(context, player)
    }

  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (context == null) {
      throw new Error('Could not get context')
    } else {
      draw(context)
    }

    // eslint-disable-next-line
  }, [players, fruit]) // Draw on incoming emited changes

  return <canvas width={`${canvasSize}px`} height={`${canvasSize}px`} ref={canvasRef} />
}
