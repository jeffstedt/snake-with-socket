import { io } from 'socket.io-client'
import { Config } from './Config'

export const socket = io(`http://localhost:${Config.SERVER_PORT}`, {
  transports: ['websocket'],
})
