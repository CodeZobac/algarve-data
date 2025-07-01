import { NextRequest, NextResponse } from "next/server";
import { sendInviteEmail } from "@/app/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, link } = await req.json();

    if (!email || !link) {
      return NextResponse.json(
        { error: "Email and link are required" },
        { status: 400 }
      );
    }

    const success = await sendInviteEmail(email, link);

    if (success) {
      return NextResponse.json({ message: "Invite sent successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to send invite" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
