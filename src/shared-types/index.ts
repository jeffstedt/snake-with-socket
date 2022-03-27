export enum EVENT {
  'DIRECTION_UPDATE' = 'direction_update',
  'STATE_UPDATE' = 'state_update',
}

export enum MSG {
  'CONNECT' = 'connect', // This keyword is socket io magic
  'DISCONNECT' = 'disconnect',
  'INITIALIZE' = 'initialize',
  'START_UP' = 'start_up',
  'START_GAME' = 'start_game',
}

export enum PlayerDirection {
  'UP' = 'UP',
  'RIGHT' = 'RIGHT',
  'LEFT' = 'LEFT',
  'DOWN' = 'DOWN',
}

export enum ArrowKey {
  'ARROWUP' = 'ARROWUP',
  'ARROWRIGHT' = 'ARROWRIGHT',
  'ARROWDOWN' = 'ARROWDOWN',
  'ARROWLEFT' = 'ARROWLEFT',
}

export enum CharacterKey {
  'W' = 'W',
  'D' = 'D',
  'S' = 'S',
  'A' = 'A',
}

export enum COLOR {
  'RED' = '#cc0000',
  'GREEN' = '#009a3e',
  'BLUE' = '#3498db',
  'ORANGE' = '#ff8800',
  'PURPLE' = '#8e44ad',
}

// Model
export type Model = Loading | Init | Select | Playing | Error

export interface Game {
  players: Player[]
  fruit: Fruit
}

export interface Loading extends Game {
  state: 'Loading'
}

export interface Init extends Game {
  state: 'Init'
}

export interface Playing extends Game {
  state: 'Playing'
}

export interface Select extends Game {
  state: 'Select'
}

export interface Error extends Game {
  state: 'Error'
}

export interface Position {
  x: number
  y: number
}

export interface Colors {
  red: COLOR
  green: COLOR
  blue: COLOR
  orange: COLOR
  purple: COLOR
}

export interface Fruit {
  color: COLOR
  size: number
  position: Position
}

export interface Player {
  id: string
  name: string
  color: COLOR
  size: number
  length: number
  position: Position
  positions: Position[]
  direction: PlayerDirection
}

export type ServerState = 'Loading' | 'Init' | 'Select' | 'Playing' | 'Error' | 'Disconnected'

export interface Settings {
  canvasSize: number
  cellSize: number
  color: Colors
}
