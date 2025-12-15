




require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');


const app = express();
const path = require("path");

//  Serve uploads folder as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON parsing middleware
app.use(express.json());

// यह JSON parsing के लिए जरूरी है
app.use(express.json());
// Auth routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB Connected');

    // Start server after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
 console.log(` Server running on http://localhost:${process.env.PORT || 5000}`);    });
  } catch (err) {
    console.error(' DB connection error:', err.message);
    process.exit(1); // Exit process if DB fails
  }
};

connectDB();
