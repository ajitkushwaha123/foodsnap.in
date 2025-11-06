import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Billing from "@/models/Billing";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { name, email, phone } = await req.json();

    const { userId } = await getUserId(req);

    if (!name || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields (name, email, phone) are required",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    let billing = await Billing.findOne({ userId });

    if (!billing) {
      billing = await Billing.create({
        userId,
        name,
        email,
        phone,
      });
    } else {
      billing.name = name;
      billing.email = email;
      billing.phone = phone;
      await billing.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Billing details saved successfully",
        billing,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Billing save error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
