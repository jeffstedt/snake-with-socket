import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {
  EVENT,
  MSG,
  Player,
  KeyDown,
  Model,
  PlayerPosition,
} from "./Interface";

const httpServer = createServer();
const io = new Server(httpServer);

const TICK_RATE = 20;

let tick = 0;
let previous = hrtimeMs();
let tickLengthMs = 1000 / TICK_RATE;

const playerSize = 10;
const canvasSize = 500;

const defaultModel = (): Model => ({
  state: "Loading",
  players: [],
});

let model: Model = {
  state: "Init",
  players: [],
};

type Msg =
  | { type: "Init"; socketId: string; player: Player }
  | { type: "Playing" }
  | { type: "Loading" }
  | { type: "Disconnect"; socketId: string }
  | { type: "PositionUpdate"; socketId: string; keyDown: KeyDown };

function updateModel(prevModel: Model, msg: Msg) {
  switch (msg.type) {
    case "Init":
      model = {
        ...prevModel,
        state: "Playing",
        players: [createPlayer(msg.socketId, msg.player.color)],
      };
      break;
    case "Playing":
      model = { ...prevModel, state: "Playing" };
      break;
    case "Disconnect":
      model = {
        ...prevModel,
        state: "Loading",
        players:
          model.players?.filter((player) => player.id === msg.socketId) || [],
      };
      break;
    case "PositionUpdate":
      model = {
        ...prevModel,
        state: "Playing",
        players:
          model.players?.map((player) =>
            player.id === msg.socketId
              ? {
                  ...player,
                  position: getNewPlayerPosition(player.position, msg.keyDown),
                }
              : player
          ) || [],
      };
      break;
    case "Loading":
      model = { ...prevModel, ...defaultModel() };
      break;
    default:
      model = prevModel;
      break;
  }
}

// Server Logic
io.sockets.on(MSG.CONNECT, (socket: Socket) => {
  console.log("New connection established:", socket.id);
  updateModel(model, { type: "Loading" });

  socket.on(MSG.INITIALIZE, (player: Player) => {
    // Client wants to start a new game
    updateModel(model, { type: "Init", socketId: socket.id, player });

    if (model.players?.length === 1 && model.state === "Playing") {
      gameLoop();
    } else {
      updateModel(model, { type: "Loading" });
    }
  });

  socket.on(EVENT.POSITION_UPDATE, (keyDown: KeyDown) => {
    // Client wants us to update the position
    const allowedKeyEvents =
      keyDown === "ArrowUp" ||
      keyDown === "ArrowDown" ||
      keyDown === "ArrowRight" ||
      keyDown === "ArrowLeft";

    if (allowedKeyEvents) {
      updateModel(model, {
        type: "PositionUpdate",
        socketId: socket.id,
        keyDown,
      });
    }
  });

  socket.on(MSG.DISCONNECT, () => {
    updateModel(model, { type: "Disconnect", socketId: socket.id });
  });
});

function gameLoop() {
  if (model.state === "Playing" && model.players && model.players.length > 0) {
    setTimeout(gameLoop, tickLengthMs);
  } else {
    updateModel(model, { type: "Loading" });
  }

  let now = hrtimeMs();
  let delta = (now - previous) / 1000;

  // Update
  // ...

  // Then emit
  io.emit(EVENT.STATE_UPDATE, model.players);
  console.log(JSON.stringify({ delta, tick, model }, null, 2));

  previous = now;
  tick++;
}

// Utills

function hrtimeMs() {
  let time = process.hrtime();
  return time[0] * 1000 + time[1] / 1000000;
}

const createPlayer = (id: string, color: string) => ({
  id,
  color,
  position: { x: canvasSize / 2, y: canvasSize / 2 },
});

function getNewPlayerPosition(position: PlayerPosition, keyDown: KeyDown) {
  switch (keyDown) {
    case "ArrowUp":
      return { ...position, y: position.y - playerSize };
    case "ArrowDown":
      return { ...position, y: position.y + playerSize };
    case "ArrowRight":
      return { ...position, x: position.x + playerSize };
    case "ArrowLeft":
      return { ...position, x: position.x - playerSize };
  }
}

console.log("Server now running on port", 3001);
httpServer.listen(3001);
