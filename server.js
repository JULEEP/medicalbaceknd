import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDatabase from './db/connectDatabase.js';
import path from 'path'; // Import path to work with file and directory paths
import UserRoutes from './Routes/userRoutes.js';
import ServiceRoutes from './Routes/ServiceRoutes.js';
import CategoryRoutes from './Routes/categoryRoutes.js';
import { fileURLToPath } from 'url';  // Import the fileURLToPath method
import cloudinary from './config/cloudinary.js';
import fileUpload from 'express-fileupload';
import pharmacyRoutes from './Routes/pharmacyRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import vendorRoutes from './Routes/vendorRoutes.js';
import riderRoutes from './Routes/riderRoutes.js';
import { Server } from 'socket.io'; // Corrected import of socket.io
import Chat from './Models/Chat.js';

dotenv.config();

const app = express();

// Get file path info for __dirname (for file serving)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS for multiple origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://31.97.206.144:8021', 'http://31.97.206.144:8033'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Database connection
connectDatabase();

// Middleware to handle file uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/', // Temporary directory to store files before upload
}));

// Default route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to our service!",
  });
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Set the port
const port = process.env.PORT || 4062;

// Create HTTP server with Express app
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server); // Use the `Server` class from `socket.io` package

app.set('io', io);

// Define your routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/service', ServiceRoutes);
app.use('/api/category', CategoryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/rider', riderRoutes);

// Socket.IO logic to handle real-time communication
io.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);  // Log when a socket is connected

  socket.on('sendMessage', async ({ riderId, userId, message, senderType }) => {
    try {
      // Log the received message details to ensure it's reaching the server
      console.log('Received sendMessage event:', { riderId, userId, message, senderType });

      const newMessage = new Chat({
        riderId,
        userId,
        message,
        senderType,
        timestamp: new Date(),
      });

      const savedMessage = await newMessage.save();  // Save message to DB

      // Log the saved message to confirm it was stored in the DB
      console.log('Message saved:', savedMessage);

      // Emit the message to the appropriate room
      const roomId = `${riderId}_${userId}`;
      console.log(`Emitting message to room: ${roomId}`);
      io.to(roomId).emit('receiveMessage', savedMessage);  // Emit to the right room
      console.log('Message emitted to room:', roomId);  // Log successful emission

    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });

  // Log when socket disconnects
  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});


// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
