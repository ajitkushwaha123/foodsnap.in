import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      isAdmin: user.isAdmin,
      credits: user.credits,
      plan: user.subscription.plan,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
