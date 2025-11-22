import { NextResponse } from "next/server";
import Ticket from "@/models/Ticket";
import dbConnect from "@/lib/dbConnect";
import { getUserId } from "@/helpers/auth";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();

    const authResult = await getUserId(req);
    const userId = authResult?.userId;
    const body = await req.json();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized request.",
          action: {
            redirect: "/login",
            buttonText: "Login",
          },
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
          action: {
            redirect: "/login",
            buttonText: "Login",
          },
        },
        { status: 404 }
      );
    }

    let { name, email, phone, subject, message } = body;
    if (!name) name = user.name;
    if (!phone) phone = user.phone;

    if (!phone || !subject || !message) {
      return NextResponse.json(
        {
          error: "All fields are required.",
          action: {
            redirect: "/support",
            buttonText: "Try Again",
          },
        },
        { status: 400 }
      );
    }

    const hasCredits = true;
    if (!hasCredits) {
      return NextResponse.json(
        {
          error: "You are out of credits.",
          action: {
            redirect: "/pricing",
            buttonText: "View Plans",
          },
        },
        { status: 402 }
      );
    }

    const newTicket = await Ticket.create({
      user: userId,
      status: "open",
      priority: "medium",
      details: { name, phone, email, subject, message },
    });

    return NextResponse.json(
      {
        message: "Ticket submitted successfully.",
        ticket: newTicket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ticket Creation Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
        action: {
          redirect: "/support",
          buttonText: "Help Desk",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { userId } = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized request.",
          action: {
            redirect: "/login",
            buttonText: "Login",
          },
        },
        { status: 401 }
      );
    }

    const tickets = await Ticket.find({ user: userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        message: "Tickets fetched successfully.",
        tickets,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ticket Fetch Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load tickets.",
        action: {
          redirect: "/support",
          buttonText: "Help Desk",
        },
      },
      { status: 500 }
    );
  }
}
