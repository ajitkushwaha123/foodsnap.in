import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  await dbConnect();

  const user = await User.findOne({ clerkId: userId });

  if (!user) return new Response("User not found", { status: 404 });

  return NextResponse.json({ credits: user.credits });
}
