export enum EVENT {
  CONNECT = 'connect', // This keyword is socket io magic
  DISCONNECT = 'disconnect',
  INITIALIZE = 'initialize',
  JOIN_ROOM = 'join_room',
  CREATE_ROOM = 'create_room',
  SELECT_GAME = 'select_game',
  READY = 'ready',
  DIRECTION_UPDATE = 'direction_update',
  GAME_UPDATE = 'game_update',
  EXIT_GAME = 'exit_game',
}

export enum PlayerDirection {
  Up = 'UP',
  Right = 'RIGHT',
  Left = 'LEFT',
  Down = 'DOWN',
}

export enum ArrowKey {
  ArrowUp = 'ARROWUP',
  ArrowRight = 'ARROWRIGHT',
  ArrowDown = 'ARROWDOWN',
  ArrowLeft = 'ARROWLEFT',
}

export enum CharacterKey {
  W = 'W',
  D = 'D',
  S = 'S',
  A = 'A',
}

export enum Color {
  Red = '#cc0000',
  Green = '#009a3e',
  Blue = '#3498db',
  Orange = '#ff8800',
  Purple = '#8e44ad',
}

export enum State {
  Loading = 'Loading',
  Init = 'Init',
  Playing = 'Playing',
  Select = 'Select',
  WaitingRoom = 'WaitingRoom',
  Error = 'Error',
  Disconnected = 'Disconnected',
}

// Model
export type Model = Loading | Init | Select | WaitingRoom | Playing | Error

// Todo: In a multiplayer mode, the model probably needs needs support multiprocessing like this..
// export type Model = Room[]
// type Room = Loading | Init | Select | WaitingRoom | Playing | Error
// But then, the gameloop sort of always needs to run.
// Either that, or we need to spin up new server instances for each unique room with the current model

export interface Game {
  players: Player[]
  fruit: Fruit
}

export interface Loading extends Game {
  state: State.Loading
}

export interface Init extends Game {
  state: State.Init
}

export interface Playing extends Game {
  state: State.Playing
}

export interface Select extends Game {
  state: State.Select
}

export interface WaitingRoom extends Game {
  state: State.WaitingRoom
}

export interface Error extends Game {
  state: State.Error
}

export interface Input {
  color: Color | null
  name: string
}

export interface CreateRoomInput {
  playerId: string
  name: string
  color: Color
}

export interface JoinRoomInput {
  roomId: string
  playerId: string
  name: string
  color: Color
}

export interface ReadyInput {
  playerId: string
  roomId: string
}

export type NewPlayerInput = CreateRoomInput

export interface Position {
  x: number
  y: number
}

export interface Colors {
  red: Color
  green: Color
  blue: Color
  orange: Color
  purple: Color
}

export interface Fruit {
  color: Color
  size: number
  position: Position
}

export interface Player {
  id: string
  roomId: string
  name: string
  color: Color
  size: number
  length: number
  position: Position
  positions: Position[]
  direction: PlayerDirection
}

export interface Settings {
  canvasSize: number
  cellSize: number
  color: Colors
  playerNameMaxLength: number
}
