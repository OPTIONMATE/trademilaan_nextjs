import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email },
    SECRET,
    { expiresIn: "7d" }
  );

export const verifyToken = (token) => jwt.verify(token, SECRET);
