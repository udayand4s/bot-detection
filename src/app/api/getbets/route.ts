import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import BetModel from "@/models/schemas";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        await dbConnect();
        const data= await BetModel.find()
        return NextResponse.json({
            success: true,
            bets: data,
        });
    } catch (error) {
        console.error("Error in GET /api/getbets:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while fetching bets.",
        });
        
    }
}