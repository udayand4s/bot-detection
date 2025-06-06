import { Schema, model, models } from 'mongoose';

export interface Bet extends Document {
    userId: string;
    ipAdress: string;
    betAmount: number;
    timestamp: Date;
    gameId: string;
    gameName: string;
    flagged: boolean;
}
const betSchema = new Schema<Bet>({
    userId: { type: String, required: true },
    ipAdress: { type: String, required: true },
    betAmount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    gameId: { type: String, required: true },
    gameName: { type: String, required: true },
    flagged: { type: Boolean, default: false }
});

const BetModel = models.Bet || model<Bet>('Bet', betSchema);    
export default BetModel;