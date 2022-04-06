export enum EVENT {
  CONNECT = 'connect', // This keyword is socket io magic
  DISCONNECT = 'disconnect',
  INITIALIZE = 'initialize',
  SELECT_GAME = 'select_game',
  START_GAME = 'start_game',
  DIRECTION_UPDATE = 'direction_update',
  GAME_UPDATE = 'game_update',
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
  Error = 'Error',
  Disconnected = 'Disconnected',
}

// Model
export type Model = Loading | Init | Select | Playing | Error

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

export interface Error extends Game {
  state: State.Error
}

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
