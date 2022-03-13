import { useRef, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

export interface Player {
  id: string
  color: string
  size: number
  position: Position
}

export interface Fruit {
  color: string
  size: number
  position: Position
}

interface Props {
  [x: string]: any
  players: Player[]
  fruit: Fruit | null
}

export default function Canvas({ players, fruit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function draw(context: CanvasRenderingContext2D) {
    // Draw play board
    context.fillStyle = '#1a1a1c'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    for (let index = 0; index <= context.canvas.width; index += 25) {
      context.moveTo(0.5 + index, 0)
      context.lineTo(0.5 + index + 0, context.canvas.height)
    }

    for (let index = 0; index <= context.canvas.height; index += 25) {
      context.moveTo(0, 0.5 + index)
      context.lineTo(context.canvas.width, 0.5 + index)
    }

    context.strokeStyle = '#24272d'
    context.stroke()

    // Fraw fruit
    if (fruit) {
      context.beginPath()
      context.fillStyle = fruit.color
      context.arc(fruit.size / 2 + fruit.position.x, fruit.position.y + fruit.size / 2, fruit.size / 2, 0, 2 * Math.PI)
      context.fill()
    }

    // Draw players
    for (let index = 0; index < players.length; index++) {
      context.fillStyle = players[index].color
      context.fillRect(players[index].position.x, players[index].position.y, players[index].size, players[index].size)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (context == null) throw new Error('Could not get context')

    draw(context)
  }, [players, fruit]) //Listen to players change

  return <canvas width="500px" height="500px" ref={canvasRef} />
}
