const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Join organization room
  socket.on('join_organization', (organizationId) => {
    socket.join(`org_${organizationId}`);
    console.log(`Client ${socket.id} joined organization ${organizationId}`);
  });

  // Leave organization room
  socket.on('leave_organization', (organizationId) => {
    socket.leave(`org_${organizationId}`);
    console.log(`Client ${socket.id} left organization ${organizationId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Subscribe to Supabase realtime changes
const channel = supabase
  .channel('ai_interactions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'ai_interactions'
    },
    (payload) => {
      console.log('📨 New interaction detected:', payload.new.id);
      
      // Broadcast to organization room
      const organizationId = payload.new.organization_id;
      io.to(`org_${organizationId}`).emit('interaction_flagged', {
        type: 'new_interaction',
        data: payload.new
      });
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'violations'
    },
    (payload) => {
      console.log('🚨 New violation detected:', payload.new.id);
      
      // Get organization_id from interaction
      supabase
        .from('ai_interactions')
        .select('organization_id')
        .eq('id', payload.new.interaction_id)
        .single()
        .then(({ data }) => {
          if (data) {
            io.to(`org_${data.organization_id}`).emit('violation_detected', {
              type: 'violation',
              data: payload.new
            });
          }
        });
    }
  )
  .subscribe();

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Real-time server running on port ${PORT}`);
  console.log(`✅ Supabase realtime subscription active`);
});

