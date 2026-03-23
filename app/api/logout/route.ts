import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const current = await getCurrentUserFromCookie();

  if (current?.userId) {
    await prisma.auditLog.create({
      data: {
        event: "LOGOUT",
        userId: current.userId,
      },
    });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
