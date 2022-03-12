import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { EVENT, MSG, Player, KeyDown, Model } from "./Interface";

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
        //  Only 1 player allowed, for now
        players: [createPlayer(msg.socketId, msg.player.color)],
      };
      break;
    case "Playing":
      model = { ...prevModel };
      break;
    case "Loading":
      model = { ...prevModel, ...defaultModel() };
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
              ? getNewPlayerPosition(player, msg.keyDown)
              : player
          ) || [],
      };
      break;
    default:
      model = { ...prevModel };
      break;
  }
}

// Server Logic
io.sockets.on(MSG.CONNECT, (socket: Socket) => {
  console.log("New connection established:", socket.id);

  socket.on(MSG.DISCONNECT, () => {
    // Player dc:ed, remove player
    updateModel(model, { type: "Disconnect", socketId: socket.id });
  });

  socket.on(EVENT.POSITION_UPDATE, (keyDown: KeyDown) => {
    if (model.state === "Playing") {
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
    }
  });

  socket.on(MSG.INITIALIZE, (player: Player) => {
    // Client wants to start a new game
    updateModel(model, { type: "Init", socketId: socket.id, player });

    if (model.players?.length === 1 && model.state === "Playing") {
      gameLoop();
    } else {
      updateModel(model, { type: "Loading" });
    }
  });
});

function hrtimeMs() {
  let time = process.hrtime();
  return time[0] * 1000 + time[1] / 1000000;
}

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
  console.log(JSON.stringify({ delta, tick, model }));

  previous = now;
  tick++;
}

// Utills
const createPlayer = (id: string, color: string) => ({
  id,
  color,
  position: { x: canvasSize / 2, y: canvasSize / 2 },
});

function getNewPlayerPosition(player: Player, keyDown: KeyDown) {
  switch (keyDown) {
    case "ArrowUp":
      return {
        ...player,
        position: { ...player.position, y: player.position.y - playerSize },
      };
    case "ArrowDown":
      return {
        ...player,
        position: { ...player.position, y: player.position.y + playerSize },
      };
    case "ArrowRight":
      return {
        ...player,
        position: { ...player.position, x: player.position.x + playerSize },
      };
    case "ArrowLeft":
      return {
        ...player,
        position: { ...player.position, x: player.position.x - playerSize },
      };
  }
}

console.log("Server now running on port", 3001);
httpServer.listen(3001);
