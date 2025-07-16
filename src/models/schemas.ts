import { Schema, model, models, Document } from 'mongoose';

export interface Bet extends Document {
    userId: string;
    betAmount: number;
    ipAddress: string;
    timestamp: Date;
    gameId: string;
    gameName: string;
    flagged: boolean;
    geo?: {
        country?: string;
        region?: string;
        city?: string;
        ll?: number[]; 
        timezone?: string;
    }
}

const betSchema = new Schema<Bet>({
    userId: { type: String, required: true },
    ipAddress: { type: String, required: true }, 
    betAmount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    gameId: { type: String, required: true },
    gameName: { type: String, required: true },
    flagged: { type: Boolean, default: false },
    geo: {
        country: { type: String, required: false },
        region: { type: String, required: false },
        city: { type: String, required: false },
        ll: { type: [Number], required: false },
        timezone: { type: String, required: false },
    },
});

const BetModel = models.Bet || model<Bet>('Bet', betSchema);
export default BetModel;
