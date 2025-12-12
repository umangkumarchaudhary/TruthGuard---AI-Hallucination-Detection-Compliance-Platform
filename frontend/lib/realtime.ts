'use client'

import { io, Socket } from 'socket.io-client'

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:3001'

let socket: Socket | null = null

export function connectRealtime(organizationId: string): Socket {
  if (socket?.connected) {
    return socket
  }

  socket = io(REALTIME_URL, {
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('✅ Connected to real-time server')
    socket?.emit('join_organization', organizationId)
  })

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from real-time server')
  })

  socket.on('interaction_flagged', (data) => {
    console.log('📨 New interaction:', data)
    // Handle new interaction event
  })

  socket.on('violation_detected', (data) => {
    console.log('🚨 New violation:', data)
    // Handle violation event
  })

  return socket
}

export function disconnectRealtime() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket(): Socket | null {
  return socket
}

