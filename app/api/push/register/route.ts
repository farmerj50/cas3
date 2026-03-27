import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token, platform } = (await req.json()) as {
    token: string;
    platform: string;
  };

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  // Upsert: update userId if the same device logs in with a different account
  await (prisma.pushToken.upsert as any)({
    where: { token },
    create: {
      token,
      platform: platform || "unknown",
      userId: current.userId,
    },
    update: {
      userId: current.userId,
      platform: platform || "unknown",
    },
  });

  return NextResponse.json({ ok: true });
}
