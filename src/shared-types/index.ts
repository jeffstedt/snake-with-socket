// Todo: Breakout EVENT into two seperate: ROOM_EVENT, PLAYER_EVENT
export enum EVENT {
  CONNECT = 'connect', // This keyword is socket io magic
  DISCONNECT = 'disconnect',
  GAME_SETTINGS = 'game_settings',
  INIT_SELECT_SCREEN = 'init_select_screen',
  SELECT_SCREEN = 'select_screen',
  JOIN_ROOM = 'join_room',
  CREATE_ROOM = 'create_room',
  PLAYER_READY = 'player_ready',
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

export type Rooms = Room[]

export type Room = {
  id: UUID
  state: Loading | Init | Select | WaitingRoom | Playing | Error
  players: Player[]
  fruit: Fruit
}

type Loading = State.Loading
type Init = State.Init
type Playing = State.Playing
type Select = State.Select
type WaitingRoom = State.WaitingRoom
type Error = State.Error

export interface Input {
  color: Color
  name: string
}

export interface CreateRoomInput {
  playerId: UUID
  name: string
  color: Color
}

export interface JoinRoomInput {
  roomId: UUID
  playerId: UUID
  name: string
  color: Color
}

export interface ReadyInput {
  playerId: UUID
  roomId: UUID
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
  id: UUID
  roomId: UUID
  ready: boolean
  name: string
  color: Color
  size: number
  points: number
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
