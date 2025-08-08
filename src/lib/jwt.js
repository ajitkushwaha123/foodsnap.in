import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};
