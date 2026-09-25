const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const setupChatSocket = require('./sockets/chatSocket');

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupChatSocket(io);

const PORT = process.env.PORT || 5000;
const liveUrl = process.env.RENDER_EXTERNAL_URL || 'https://campusride-backend-03ea.onrender.com';

// Deployment Trigger: 2026-08-21 02:16:00
server.listen(PORT, () => {
  console.log(`
  ======================================================
  🚗 CampusRide Full-Stack Server Running on Port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 Live API Health: ${liveUrl}/api/health
  ======================================================
  `);
});
