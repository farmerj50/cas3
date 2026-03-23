import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "cash3_token";

type TokenPayload = {
  userId: string;
  email: string;
};

export function signToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is missing");
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
