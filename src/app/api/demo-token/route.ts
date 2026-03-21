import { NextResponse } from "next/server";
import { auth } from "~/server/better-auth";

export async function POST() {
  try {
    // Use Better Auth's JWT plugin to sign a token for the demo user
    const result = await auth.api.signJWT({
      body: {
        payload: {
          sub: "demo_tanush",
          email: "tanush@stride.demo",
          name: "Tanush",
        },
      },
    });

    return NextResponse.json({ token: result.token });
  } catch (error) {
    console.error("Demo token error:", error);
    return NextResponse.json(
      { error: "Failed to generate demo token" },
      { status: 500 },
    );
  }
}
