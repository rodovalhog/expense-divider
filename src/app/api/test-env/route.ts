import { NextResponse } from "next/server";

export async function GET() {
    const googleId = process.env.AUTH_GOOGLE_ID;
    const googleSecret = process.env.AUTH_GOOGLE_SECRET;

    console.log("--- DEBUG ENV VARIABLES ---");
    console.log("AUTH_GOOGLE_ID:", googleId ? `'${googleId}'` : "UNDEFINED");
    console.log("AUTH_GOOGLE_ID length:", googleId ? googleId.length : 0);
    console.log("AUTH_GOOGLE_SECRET is set:", !!googleSecret);
    console.log("---------------------------");

    return NextResponse.json({
        status: "Check server console",
        googleIdObscured: googleId ? googleId.substring(0, 5) + "..." : "missing"
    });
}
