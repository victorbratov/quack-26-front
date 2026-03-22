import { NextResponse } from "next/server";

const DEMO_USERS = {
  tanush: {
    sub: "demo_tanush",
    email: "tanush@stride.app",
    name: "Tanush",
  },
  sarah: {
    sub: "demo_sarah",
    email: "sarah@stride.app",
    name: "Sarah",
  },
  jake: {
    sub: "demo_jake",
    email: "jake@stride.app",
    name: "Jake",
  },
  emma: {
    sub: "demo_emma",
    email: "emma@stride.app",
    name: "Emma",
  },
} as const;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { userId?: string };
    const userId = (body.userId as keyof typeof DEMO_USERS) || "tanush";
    const user = DEMO_USERS[userId] || DEMO_USERS.tanush;

    // The backend has a bypass for tokens starting with "demo_"
    // We can simply return the user ID as the token
    console.log(`Generating demo token for ${userId}: ${user.sub}`);
    return NextResponse.json({ token: user.sub });
  } catch (error) {
    console.error("Demo token error:", error);
    return NextResponse.json(
      { error: "Failed to generate demo token" },
      { status: 500 },
    );
  }
}
