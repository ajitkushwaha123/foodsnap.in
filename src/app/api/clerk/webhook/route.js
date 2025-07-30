import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req) {
  const payload = await req.text();
  const headerPayload = headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  await dbConnect();

  switch (eventType) {
    case "user.created":
      try {
        const existing = await User.findOne({ clerkId: data.id });

        if (!existing) {
          await User.create({
            clerkId: data.id,
            email: data.email_addresses?.[0]?.email_address,
            name: data.first_name || "",
            profileImage: data.image_url || "",
            plan: "free",
            credits: 10,
            subscription: {
              isActive: false,
            },
          });
          console.log("✅ User created in DB:", data.id);
        } else {
          console.log("⚠️ User already exists:", data.id);
        }
      } catch (err) {
        console.error("Error saving user:", err);
      }
      break;

    case "user.updated":
      try {
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            name: data.first_name || "",
            email: data.email_addresses?.[0]?.email_address,
            profileImage: data.image_url || "",
          }
        );
        console.log("✅ User updated in DB:", data.id);
      } catch (err) {
        console.error("Error updating user:", err);
      }
      break;

    case "user.deleted":
      try {
        await User.findOneAndDelete({ clerkId: data.id });
        console.log("✅ User deleted from DB:", data.id);
      } catch (err) {
        console.error("Error deleting user:", err);
      }
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return NextResponse.json({ success: true });
}
