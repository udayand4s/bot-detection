import dbConnect from "@/lib/dbConnect";
import BetModel from "@/models/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
try{
    console.log("starting...")
    await dbConnect();
    console.log("db connected")
    const body = await req.json();

    // Get the client's IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        "unknown";

    // Get geolocation data from IP
    let geoData = null;
    if (clientIP && clientIP !== 'unknown' && clientIP !== '127.0.0.1' && clientIP !== '::1') {
        try {
            const response = await fetch(`https://ipapi.co/${clientIP}/json/`);
            geoData = await response.json();
        }
        catch (error) {
            console.error("Error fetching geolocation data:", error);
        }
    }

    const geo = geoData ? {
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
        ll: geoData.ll, // [latitude, longitude]
        timezone: geoData.timezone,
    } : {
        country: body.country || null,
        region: body.region || null,
        city: body.city || null,
        ll: body.ll || null,
    };

    const bet = await BetModel.create({
        userId: body.userId,
        ipAddress: clientIP,
        betAmount: body.betAmount,
        timestamp: body.timestamp,
        gameId: body.gameId,
        gameName: body.gameName,
        flagged: body.flagged || false,
        geo: geo,
    });

    return NextResponse.json({
        success: true,
        bet,
    });

}catch (error) {
    console.error("Error in POST /api/bet:", error);
    return NextResponse.json({
        success: false,
        message: "Failed to create bet",
        error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
}}