import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BetModel from '@/models/schemas';

export async function POST(req: NextRequest){
    try{
        await dbConnect();
        
        // Step 1: Get all bets with required fields
        const bets = await BetModel.find({}, 'userId betAmount gameId gameName flagged timestamp geo')
            .sort({ timestamp: -1 });
        
        // Step 2: Aggregation pipeline to find frequent bettors
        const frequentBettors = await BetModel.aggregate([
            {
                // Match bets from last 7 days
                $match: {
                    timestamp: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            },
            {
                // Group by userId and calculate betting statistics
                $group: {
                    _id: '$userId',
                    totalBets: { $sum: 1 },                    // Count total bets
                    totalAmount: { $sum: '$betAmount' },       // Sum of all bet amounts
                    avgBetAmount: { $avg: '$betAmount' },      // Average bet amount
                    firstBet: { $min: '$timestamp' },          // First bet timestamp
                    lastBet: { $max: '$timestamp' },           // Last bet timestamp
                    games: { $addToSet: '$gameName' },         // Unique games played
                    flaggedBets: {                             // Count of flagged bets
                        $sum: {
                            $cond: [{ $eq: ['$flagged', true] }, 1, 0]
                        }
                    }
                }
            },
            {
                // Add calculated fields for analysis
                $addFields: {
                    // Calculate betting frequency (bets per hour)
                    bettingDuration: {
                        $divide: [
                            { $subtract: ['$lastBet', '$firstBet'] },
                            1000 * 60 * 60 
                        ]
                    },
                    uniqueGamesCount: { $size: '$games' },
                    flaggedPercentage: {
                        $multiply: [
                            { $divide: ['$flaggedBets', '$totalBets'] },
                            100
                        ]
                    }
                }
            },
            {
                $addFields: {
                    // Bets per hour (handle division by zero)
                    betsPerHour: {
                        $cond: [
                            { $gt: ['$bettingDuration', 0] },
                            { $divide: ['$totalBets', '$bettingDuration'] },
                            '$totalBets' // If duration is 0, use total bets
                        ]
                    }
                }
            },
            {
                // Filter for suspicious frequent betting patterns
                $match: {
                    $or: [
                        { totalBets: { $gte: 50 } },           // More than 50 bets in 7 days
                        { betsPerHour: { $gte: 5 } },          // More than 5 bets per hour on average
                        { 
                            $and: [
                                { totalBets: { $gte: 20 } },   // At least 20 bets
                                { uniqueGamesCount: { $lte: 2 } } // Playing only 1-2 games (focused behavior)
                            ]
                        }
                    ]
                }
            },
            {
                // Sort by most suspicious first
                $sort: {
                    betsPerHour: -1,    // Highest betting frequency first
                    totalBets: -1       // Then by total bets
                }
            },
            {
                // Limit results for performance
                $limit: 100
            }
        ]);
        
        // Step 3: Additional analysis - Calculate suspicious scores
        const suspiciousUsers = frequentBettors.map(user => {
            let suspiciousScore = 0;
            
            // Scoring algorithm 
            if (user.betsPerHour > 10)
                suspiciousScore += 30;
            else if (user.betsPerHour > 5) 
                suspiciousScore += 15;
            
            if (user.totalBets > 100) 
                suspiciousScore += 25;
            else if (user.totalBets > 50) 
                suspiciousScore += 15;
            
            if (user.uniqueGamesCount <= 1) 
                suspiciousScore += 20;
            else if (user.uniqueGamesCount <= 2) 
                suspiciousScore += 10;
            
            if (user.flaggedPercentage > 20) 
                suspiciousScore += 15;
            
            // Check for round bet amounts (potential bot behavior)
            const roundAmountPattern = user.avgBetAmount % 10 === 0;
            if (roundAmountPattern) suspiciousScore += 10;
            
            return {
                userId: user._id,
                suspiciousScore,
                ...user
            };
        });
        
        // Step 4: Sort by suspicious score and return results
        const finalResults = suspiciousUsers
            .sort((a, b) => b.suspiciousScore - a.suspiciousScore)
            .slice(0, 20); // Top 20 most suspicious
        
        return NextResponse.json({
            success: true,
            suspiciousUsers: finalResults,
            totalAnalyzed: frequentBettors.length,
            message: 'Frequent betting analysis completed'
        });
        
    } catch (error) {
        console.error('Error analyzing frequent bettors:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to analyze betting patterns'
        }, { status: 500 });
    }
}