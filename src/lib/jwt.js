import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      isAdmin: user.isAdmin,
      credits: user.credits,
      plan: user.subscription?.plan || "free",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export async function verifyJwtToken(token) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("[VERIFY_JWT_ERROR]", error);
    return null;
  }
}
