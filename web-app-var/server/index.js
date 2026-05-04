import express from 'express';
import cors from 'cors';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3001;
import connectDB from './src/config/data.js';
import routes from './src/routes/index.js';

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins (hoặc chỉ định domain cụ thể)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

import User from './src/model/user.model.js';
import Post from './src/model/posts.model.js';
import Service from './src/model/service.model.js';

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running', 
    status: 'ok',
    version: '1.0.1',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);


// Start the server
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});