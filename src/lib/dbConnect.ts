import mongoose from 'mongoose';

export async function dbConnect() {
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB is already connected');
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI as string, {
            serverSelectionTimeoutMS: 5000, // Reduced from 30000
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000, // Reduced from 30000
            bufferCommands: false,
            maxPoolSize: 10,
            retryWrites: true,
        });
        if (db.connections[0].readyState === 1) {
            console.log('MongoDB connected:');
        }
    } catch (error) {
        console.log("database connection failed", error);
        throw error
    }
}