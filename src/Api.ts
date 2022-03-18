import { io } from 'socket.io-client'

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

export type ServerState = 'Loading' | 'Init' | 'Select' | 'Playing' | 'Error'

interface Position {
  x: number
  y: number
}

export interface Player {
  id: string
  color: string
  size: number
  length: number
  position: Position
  positions: Position[]
}

export interface Fruit {
  color: string
  size: number
  position: Position
}
export interface Settings {
  state: ServerState
  canvasSize: number
  cellSize: number
}

export const socket = io('http://localhost:3001', {
  transports: ['websocket'],
})
