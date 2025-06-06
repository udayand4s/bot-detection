import mongoose from 'mongoose';

export async function dbConnect() {
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB is already connected');
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI as string,{
            serverSelectionTimeoutMS: 30000, // 30 seconds to select server
            socketTimeoutMS: 30000, // 30 seconds for socket operations
            connectTimeoutMS: 30000, // 30 seconds to establish connection
            bufferCommands: false, // Don't buffer commands if not connected
        });
        if (db.connections[0].readyState === 1) {

            console.log('MongoDB connected:');
        }
    } catch (error) {
        console.log("database connection failed", error);
        throw error
    }
}