export enum EVENT {
  'DIRECTION_UPDATE' = 'direction_update',
  'STATE_UPDATE' = 'state_update',
}

export enum MSG {
  'CONNECT' = 'connect', // This keyword is socket io magic
  'DISCONNECT' = 'disconnect',
  'INITIALIZE' = 'initialize',
  'START_UP' = 'start_up',
}

// Model
export type Model = Loading | Init | Select | Playing | Error

export type PlayerDirection = 'Up' | 'Right' | 'Left' | 'Down'

export type KeyDown = 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'

interface Game {
  players?: Player[]
  fruit?: Fruit
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

export interface Fruit {
  position: Position
}

export interface Player {
  id: string
  color: string
  size: number
  length: number
  prevPosition: Position
  position: Position[]
  direction: PlayerDirection
}
