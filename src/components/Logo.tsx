import { useEffect, useRef } from 'react'
import { Color, Settings } from 'shared-types'

interface Props {
  settings: Settings
  color: Color
}

type Context = CanvasRenderingContext2D

export default function Logo({ settings, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scale = 20
  const cellSize = settings.canvasSize / scale
  const padding = cellSize * 0.15

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    function draw(context: Context) {
      for (let index = 0; index < scale; index++) {
        context.fillStyle = color

        if (index <= 7) {
          context.globalAlpha = 0.75
        } else {
          context.globalAlpha = 1
        }

        context.fillRect((cellSize + padding / 2) * index, padding / 2, cellSize - padding, cellSize - padding)
      }
    }

    if (context == null) {
      throw new Error('Could not get context')
    } else {
      draw(context)
    }

    // eslint-disable-next-line
  }, [color])

  return (
    <div className="Logo-wrapper">
      <h1 className="Title" style={{ color: color }}>
        Snake
      </h1>
      <canvas width={`237px`} height={`${settings.canvasSize / scale}px`} ref={canvasRef} />
    </div>
  )
}
