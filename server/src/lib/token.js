import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateToken = (userId) =>
  jwt.sign({ userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwt.secret);
