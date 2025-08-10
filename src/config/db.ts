import mongoose from 'mongoose';
import { serverConfig } from '.';

export async function connectDB() {
    try {
        await mongoose.connect(serverConfig.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        throw error;
    }
}

