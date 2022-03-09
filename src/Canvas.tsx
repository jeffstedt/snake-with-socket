import { useRef, useEffect } from "react";

interface PlayerPosition {
  x: number;
  y: number;
}

interface Player {
  id: string;
  color: string;
  position: PlayerPosition;
}

interface Props {
  [x: string]: any;
  players: Player[];
}

export default function Canvas({ players }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function draw(context: CanvasRenderingContext2D) {
    // Draw canvas
    context.fillStyle = "#000000";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // Draw players
    players.forEach((player) => {
      context.fillStyle = player.color;
      context.fillRect(player.position.x, player.position.y, 10, 10);
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context == null) throw new Error("Could not get context");

    draw(context);
  }, [players]); //Listen to players change

  return <canvas width={500} height={500} ref={canvasRef} />;
}
