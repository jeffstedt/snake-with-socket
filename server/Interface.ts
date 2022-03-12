export enum EVENT {
  'DIRECTION_UPDATE' = 'direction_update',
  'STATE_UPDATE' = 'state_update',
}

export enum MSG {
  'CONNECT' = 'connect', // This keyword is socket io magic
  'DISCONNECT' = 'disconnect',
  'INITIALIZE' = 'initialize',
}

// Model
export type Model = Loading | Init | Select | Playing | Error

interface Game {
  stateChanged?: boolean
  isEmittingUpdates?: boolean
  players?: Player[]
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

export interface PlayerPosition {
  x: number
  y: number
}

export interface Player {
  id: string
  color: string
  size: number
  position: PlayerPosition
  direction: PlayerDirection
}

export type PlayerDirection = 'Up' | 'Right' | 'Left' | 'Down'

export type KeyDown = 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'
