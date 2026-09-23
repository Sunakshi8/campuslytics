require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io is wired up here as future-ready real-time infrastructure
// (per the project spec: "Future-ready support for real-time notifications").
// It is not required for the app to function - the REST notification
// endpoints work independently of this.
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' },
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });
  socket.on('disconnect', () => {});
});

// Make io available to controllers later via req.app.get('io') if real-time
// push notifications are added on top of the REST notification system.
app.set('io', io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Campuslytics API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
