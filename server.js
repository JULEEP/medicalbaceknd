import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDatabase from './db/connectDatabase.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import { Server } from 'socket.io';
import dns from 'dns';
import net from 'net'; // Add net module for better DNS control

import UserRoutes from './Routes/userRoutes.js';
import ServiceRoutes from './Routes/ServiceRoutes.js';
import CategoryRoutes from './Routes/categoryRoutes.js';
import pharmacyRoutes from './Routes/pharmacyRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import vendorRoutes from './Routes/vendorRoutes.js';
import riderRoutes from './Routes/riderRoutes.js';
import Chat from './Models/Chat.js';

dotenv.config();

const app = express();

// ==================== DNS FIX ====================
// Force IPv4 first (MongoDB Atlas needs this)
dns.setDefaultResultOrder('ipv4first');

// Set custom DNS servers (Google DNS and Cloudflare)
dns.setServers([
  '8.8.8.8',      // Google DNS
  '8.8.4.4',      // Google DNS Secondary
  '1.1.1.1',      // Cloudflare DNS
  '208.67.222.222' // OpenDNS
]);

// Optional: Increase DNS timeout (not directly possible but we can use custom resolver)
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  // Add timeout handling via setTimeout
  const timeoutId = setTimeout(() => {
    callback(new Error('DNS lookup timeout'), null);
  }, 10000); // 10 second timeout
  
  originalLookup(hostname, options, (err, address, family) => {
    clearTimeout(timeoutId);
    if (err) {
      console.error(`DNS lookup failed for ${hostname}:`, err);
    }
    callback(err, address, family);
  });
};

// Override DNS resolve for better error handling
const originalResolve = dns.resolve;
dns.resolve = (hostname, rrtype, callback) => {
  if (typeof rrtype === 'function') {
    callback = rrtype;
    rrtype = 'A';
  }
  
  const timeoutId = setTimeout(() => {
    callback(new Error('DNS resolve timeout'), null);
  }, 10000);
  
  originalResolve(hostname, rrtype, (err, records) => {
    clearTimeout(timeoutId);
    if (err) {
      console.error(`DNS resolve failed for ${hostname} (${rrtype}):`, err);
    }
    callback(err, records);
  });
};

// Override resolveSrv specifically for MongoDB
const originalResolveSrv = dns.resolveSrv;
dns.resolveSrv = (hostname, callback) => {
  console.log(`🔍 Resolving SRV record for: ${hostname}`);
  
  const timeoutId = setTimeout(() => {
    callback(new Error('SRV lookup timeout'), null);
  }, 15000); // 15 second timeout for SRV records
  
  originalResolveSrv(hostname, (err, addresses) => {
    clearTimeout(timeoutId);
    if (err) {
      console.error(`❌ SRV resolution failed for ${hostname}:`, err);
      console.log('🔄 Attempting fallback resolution...');
      
      // Try to extract hostname from SRV domain
      const match = hostname.match(/_mongodb\._tcp\.(.+)/);
      if (match && match[1]) {
        const baseDomain = match[1];
        console.log(`🔄 Falling back to A record lookup for: ${baseDomain}`);
        
        // Try to resolve A records as fallback
        dns.resolve(baseDomain, 'A', (aErr, aRecords) => {
          if (aErr) {
            console.error('❌ Fallback A record lookup failed:', aErr);
          } else {
            console.log('✅ Fallback A records found:', aRecords);
          }
        });
      }
    } else {
      console.log('✅ SRV records resolved:', addresses);
    }
    callback(err, addresses);
  });
};

// Log DNS configuration
console.log('🌐 DNS Configuration:');
console.log('   - Default order: ipv4first');
console.log('   - DNS Servers:', dns.getServers());
// =================================================

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://31.97.206.144:8021', 
    "http://31.97.206.144:8033", 
    "https://medical-delete-url.vercel.app"
  ],
  credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// File upload
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// DB connect with retry logic
const connectWithRetry = async () => {
  let retries = 5;
  while (retries) {
    try {
      console.log(`🔄 Attempting database connection... (${retries} retries left)`);
      await connectDatabase();
      console.log('✅ Database connected successfully');
      break;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      retries -= 1;
      if (retries === 0) {
        console.error('❌ All retries exhausted. Exiting...');
        process.exit(1);
      }
      console.log(`⏰ Waiting 5 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectWithRetry();

// Create server & socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // change as needed
    methods: ["GET", "POST"]
  }
});

// Attach io to app
app.set("io", io);

// ✅ Routes
app.use('/api/users', UserRoutes);
app.use('/api/service', ServiceRoutes);
app.use('/api/category', CategoryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/rider', riderRoutes);

io.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on('joinRoom', ({ userId, riderId }) => {
    const roomId = `${userId}_${riderId}`;
    socket.join(roomId);
    console.log(`✅ Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leaveRoom', ({ userId, riderId }) => {
    const roomId = `${userId}_${riderId}`;
    socket.leave(roomId);
    console.log(`❌ Socket ${socket.id} left room: ${roomId}`);
  });

  socket.on('sendMessage', async ({ userId, riderId, message, senderType }) => {
    try {
      console.log('📩 sendMessage event received:', { userId, riderId, message, senderType });

      const newMessage = new Chat({
        riderId,
        userId,
        message,
        senderType,
        timestamp: new Date(),
      });

      const savedMessage = await newMessage.save();
      console.log('💾 Message saved in DB:', savedMessage);

      const roomId = `${userId}_${riderId}`;
      io.to(roomId).emit('receiveMessage', savedMessage);
      console.log(`📤 Message emitted to room: ${roomId}`);
    } catch (error) {
      console.error('❗ Error in sendMessage:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    dns: {
      servers: dns.getServers(),
      order: 'ipv4first'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 7021;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});