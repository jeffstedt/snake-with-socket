import { createServer } from "http";
import { Server, Socket } from "socket.io";

export enum EVENT {
  "POSITION_UPDATE" = "position_update",
  "STATE_UPDATE" = "state_update",
}

export enum MSG {
  "CONNECT" = "connect", // This keyword is socket io magic
  "DISCONNECT" = "disconnect",
  "INITIALIZE" = "initialize",
}

const httpServer = createServer();
const io = new Server(httpServer);

const stateUpdateInterval = 1000 / 60;
const playerSize = 10;
const canvasSize = 500;

// Model
interface State {
  stateChanged: boolean;
  isEmittingUpdates: boolean;
  players: Player[];
}

interface PlayerPosition {
  x: number;
  y: number;
}

interface Player {
  id: string;
  color: string;
  position: PlayerPosition;
}

let state: State = {
  stateChanged: false,
  isEmittingUpdates: false,
  players: [],
};

type KeyDown = "ArrowUp" | "ArrowRight" | "ArrowDown" | "ArrowLeft";

// Server Logic
io.sockets.on(MSG.CONNECT, (socket: Socket) => {
  console.log("New connection established:", socket.id);

  socket.on(MSG.DISCONNECT, () => {
    // Player dc:ed, remove player
    updateState(state, {
      stateChanged: true,
      players: state.players.filter((player) => player.id === socket.id),
    });
  });

  socket.on(EVENT.POSITION_UPDATE, (keyDown) => {
    // Client wants us to update the position
    const allowedKeyEvents =
      keyDown === "ArrowUp" ||
      keyDown === "ArrowDown" ||
      keyDown === "ArrowRight" ||
      keyDown === "ArrowLeft";

    if (allowedKeyEvents) {
      updateState(state, {
        stateChanged: true,
        players: state.players.map((player) =>
          player.id === socket.id
            ? getNewPlayerPosition(player, keyDown)
            : player
        ),
      });
    }
  });

  socket.on(MSG.INITIALIZE, (player: Player) => {
    // Client wants to start a new game
    updateState(state, {
      stateChanged: true,
      //  Only 1 player allowed, for now
      players: [createPlayer(socket.id, player.color)],
    });

    if (state.players.length === 1 && !state.isEmittingUpdates) {
      emitState();
    }
  });
});

function emitState() {
  updateState(state, { isEmittingUpdates: true });

  // Only emit if state has changed
  if (state.stateChanged) {
    console.log("Emiting game update:", state.players);
    io.emit(EVENT.STATE_UPDATE, state.players);
    updateState(state, { stateChanged: false });
  }

  // Start game loop if we have players
  if (state.players && state.players.length > 0) {
    setTimeout(emitState, stateUpdateInterval);
  } else {
    // Stop game loop if there are no players left
    updateState(state, { isEmittingUpdates: false });
  }
}

function updateState(prevState: State, newState: Object) {
  state = { ...prevState, ...newState };
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
