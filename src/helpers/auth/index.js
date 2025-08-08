import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET;

export const getUserId = async () => {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    console.log("[JWT_TOKEN]", token);

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("[JWT_DECODED]", decoded);

    if (!decoded) return null;

    const user = await User.findById(decoded.id);

    return {
      userId: user._id,
      phone: user.phone,
      isAdmin: user.isAdmin,
    };
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
};
