const Message = require('../models/Message');

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] New client connected: ${socket.id}`);

    // Join ride conversation room
    socket.on('join_ride_room', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`[Socket.io] User ${socket.id} joined room: ride_${rideId}`);
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      const { rideId, senderId, content, senderName } = data;
      
      try {
        let msg = null;
        try {
          msg = await Message.create({
            rideId,
            senderId,
            content,
          });
        } catch (err) {}

        const payload = {
          _id: msg ? msg._id : 'msg_' + Date.now(),
          rideId,
          senderId,
          senderName: senderName || 'Student',
          content,
          createdAt: new Date().toISOString(),
        };

        // Broadcast to everyone in ride room
        io.to(`ride_${rideId}`).emit('receive_message', payload);
      } catch (error) {
        console.error('[Socket Chat Error]', error.message);
      }
    });

    // Leave room
    socket.on('leave_ride_room', (rideId) => {
      socket.leave(`ride_${rideId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;
