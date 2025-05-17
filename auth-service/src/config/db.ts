import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/concert";

// MongoDB connection options
const mongoOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15000,  // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,          // Close sockets after 45 seconds of inactivity
  family: 4,                       // Use IPv4, skip trying IPv6
};

// MongoDB connection events
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongoOptions);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

// Event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default connectDB;
