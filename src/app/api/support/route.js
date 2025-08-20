import { NextResponse } from "next/server";
import Ticket from "@/models/Ticket";
import dbConnect from "@/lib/dbConnect";
import { getUserId } from "@/helpers/auth";
import { track } from "@/lib/track";

const trackSupportEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "support",
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/support" },
  });
};

export async function POST(req) {
  let userId = null;
  let body = null;
  try {
    await dbConnect();

    const authResult = await getUserId(req);
    userId = authResult?.userId;
    body = await req.json();

    await trackSupportEvent({
      typeKey: "TICKET_CREATE_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: { subject: body?.subject, email: body?.email },
    });

    if (!userId) {
      await trackSupportEvent({
        typeKey: "TICKET_CREATE_UNAUTHORIZED",
        status: "error",
        severity: "high",
        userId: null,
        metadata: { body },
      });
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !subject || !message) {
      await trackSupportEvent({
        typeKey: "TICKET_CREATE_VALIDATION_FAILED",
        status: "error",
        severity: "medium",
        userId,
        metadata: { body },
      });
      return NextResponse.json(
        { message: "All fields are required.", success: false },
        { status: 400 }
      );
    }

    const newTicket = await Ticket.create({
      user: userId,
      status: "open",
      priority: "medium",
      details: { name, phone, email, subject, message },
    });

    await trackSupportEvent({
      typeKey: "TICKET_CREATE_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: { ticketId: newTicket._id, subject },
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
    console.error("Ticket Creation Error:", error);
    await trackSupportEvent({
      typeKey: "TICKET_CREATE_ERROR",
      status: "error",
      severity: "critical",
      userId,
      metadata: {
        error: error.message,
        body,
      },
    });
    return NextResponse.json(
      { message: "Something went wrong", error: error.message, success: false },
      { status: 500 }
    );
  }
}
