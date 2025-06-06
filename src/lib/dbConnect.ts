import mongoose from 'mongoose';

export async function dbConnect() {
    if (mongoose.connection.readyState >= 1) {
        console.log('MongoDB is already connected');
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI ?? '');
        if (db.connections[0].readyState === 1) {
            console.log('MongoDB connected:');
        }
    } catch (error) {
        console.log("database connection failed", error);
        process.exit(1)
    }
}