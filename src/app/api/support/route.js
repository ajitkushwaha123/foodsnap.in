import { NextResponse } from "next/server";
import Ticket from "@/models/Ticket";
import dbConnect from "@/lib/dbConnect";
import { getUserId } from "@/helpers/auth";

// POST /api/tickets
export async function POST(req) {
  try {
    await dbConnect();

    const { userId } = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required.", success: false },
        { status: 400 }
      );
    }

    const newTicket = await Ticket.create({
      user: userId,
      status: "open",
      priority: "medium",
      details: {
        name,
        phone,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json(
      {
        message: "Ticket submitted successfully",
        ticket: newTicket,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ticket Submission Error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
