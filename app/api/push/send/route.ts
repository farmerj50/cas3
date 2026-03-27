/**
 * Admin-only endpoint to broadcast a push notification to all users (or one user).
 * Protect this with an ADMIN_SECRET env var in production.
 *
 * POST /api/push/send
 * { "title": "...", "body": "...", "userId": "optional — omit to send to all" }
 * Header: x-admin-secret: <ADMIN_SECRET>
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/push";

export async function POST(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, body, userId, data } = (await req.json()) as {
    title: string;
    body: string;
    userId?: string;
    data?: Record<string, string>;
  };

  if (!title || !body) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const rows = await (prisma.pushToken.findMany as any)({
    where: userId ? { userId } : {},
    select: { token: true },
  });

  const tokens = (rows as { token: string }[]).map((r) => r.token);

  if (tokens.length === 0) {
    return NextResponse.json({ sent: 0, message: "No registered devices" });
  }

  await sendPush(tokens, { title, body, data });

  return NextResponse.json({ sent: tokens.length });
}
