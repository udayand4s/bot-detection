import { dbConnect } from "@/lib/dbConnect";
import BetModel from "@/models/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await dbConnect()
    const body = await req.json();
    const bet= await BetModel.create({
        userId: body.userId,
        ipAdress: req.headers.get('x-forwarded-for') || undefined,
        betAmount: body.betAmount,
        timestamp: body.timestamp,
        gameId: body.gameId,
        gameName: body.gameName,
        flagged: body.flagged || false
    });

    return NextResponse.json({
        success: true,
        bet,
    })
}