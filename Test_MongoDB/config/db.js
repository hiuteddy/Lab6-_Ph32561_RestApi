const mongoose = require('mongoose');

// Chuỗi kết nối MongoDB
const local = 'mongodb://localhost:27017/Mydatabase';

// Kết nối với MongoDB
const connect = async () => {
  try {
    await mongoose.connect(local);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

module.exports = { connect };



