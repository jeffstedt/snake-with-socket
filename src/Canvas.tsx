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
    // Draw canvas
    context.fillStyle = '#000000'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    // Draw players
    players.forEach((player) => {
      context.fillStyle = player.color
      context.fillRect(player.position.x, player.position.y, player.size, player.size)
    })

    // Fraw fruit
    if (fruit) {
      context.fillStyle = fruit.color
      context.fillRect(fruit.position.x, fruit.position.y, fruit.size, fruit.size)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (context == null) throw new Error('Could not get context')

    draw(context)
  }, [players, fruit]) //Listen to players change

  return <canvas width={500} height={500} ref={canvasRef} />
}
