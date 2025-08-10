import mongoose, { Document, Schema} from 'mongoose';

export interface IUrl extends Document {
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
}


const urlSchema = new Schema<IUrl>({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true, index: true },
    clicks: { type: Number, default: 0 }
}, { timestamps: true });

urlSchema.index({ createdAt: -1});

export const Url = mongoose.model<IUrl>('Url', urlSchema);
