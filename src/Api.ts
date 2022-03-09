import { io } from "socket.io-client";

export enum EVENT {
  "POSITION_UPDATE" = "position_update",
  "STATE_UPDATE" = "state_update",
}

export enum MSG {
  "CONNECT" = "connect", // This keyword is socket io magic
  "DISCONNECT" = "disconnect",
  "INITIALIZE" = "initialize",
}

export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
});
