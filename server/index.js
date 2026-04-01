const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, specify your frontend URL
    methods: ["GET", "POST"]
  }
});

// Store active bookings to prevent double-confirmation in-session
const activeBookings = new Map();

io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);

  // Join a unique chat room for a specific item and pair of users
  socket.on('join_room', (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  // Handle standard messaging
  socket.on('send_message', (data) => {
    const { roomId, message, senderId, timestamp } = data;
    io.to(roomId).emit('receive_message', {
      senderId,
      message,
      timestamp
    });
  });

  // Handle Booking Proposal (Owner sends, Tenant sees)
  socket.on('send_booking_proposal', (data) => {
    const { roomId, itemId, ownerId, tenantId, duration, price } = data;
    io.to(roomId).emit('receive_booking_proposal', {
      itemId,
      ownerId,
      tenantId,
      duration,
      price
    });
  });

  // Handle Booking Confirmation (Tenant accepts)
  socket.on('confirm_booking', (data) => {
    const { roomId, itemId, tenantId, duration } = data;
    
    // Broadcast fixed confirmation to both parties
    io.to(roomId).emit('booking_finalized', {
      itemId,
      tenantId,
      duration,
      status: 'confirmed'
    });
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`);
});
