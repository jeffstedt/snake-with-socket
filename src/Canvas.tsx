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
    context.fillStyle = '#000000'
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    // Draw canvas
    context.fillStyle = '#000000'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)



    // Fraw fruit
    if (fruit) {
      context.beginPath();
      context.fillStyle = fruit.color;
      context.arc(fruit.size/2 + fruit.position.x, fruit.position.y + fruit.size/2, fruit.size/2, 0, 2* Math.PI);
      context.fill();
    }

       // Draw players
       players.forEach((player) => {
        context.beginPath();
        context.fillStyle = player.color;
        context.arc(player.size/2 + player.position.x, player.position.y + player.size/2, player.size/2, 0, 2* Math.PI);
        context.fill();
      })



  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (context == null) throw new Error('Could not get context')

    draw(context)
  }, [players, fruit]) //Listen to players change

  return <canvas width="500px" height="500px" ref={canvasRef} />
}
