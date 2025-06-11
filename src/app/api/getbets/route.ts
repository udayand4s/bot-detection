import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import getRedisClient from "@/lib/redisConnect";
import BetModel from "@/models/schemas";

export async function GET(req: NextRequest) {
    // Try Redis first
    try {
        const redis = await getRedisClient();
        if (redis) {
            const cachedBets = await redis.get('all_bets');
            if (cachedBets) {
                console.log('Data from Redis');
                return NextResponse.json({
                    success: true,
                    bets: JSON.parse(cachedBets)
                });
            }
        }
    } catch (error) {
        console.log('Redis failed, trying MongoDB');
    }

    // Get from MongoDB
    try {
        await dbConnect();
        const bets = await BetModel.find();
        
        // Save to Redis
        try {
            const redis = await getRedisClient();
            if (redis) {
                await redis.setEx('all_bets', 300, JSON.stringify(bets));
                console.log('Data saved to Redis');
            }
        } catch (error) {
            console.log('Could not save to Redis');
        }
        
        return NextResponse.json({
            success: true,
            bets: bets
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Error fetching bets"
        });
    }
}