import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { STATES } from "@/lib/states";

const VALID_CODES = new Set(STATES.map((s) => s.code));

export async function PATCH(req: NextRequest) {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { state } = await req.json();
  if (!VALID_CODES.has(state)) {
    return NextResponse.json({ error: "Invalid state code" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.user.update({
    where: { id: current.userId },
    data: { state } as any,
  });

  return NextResponse.json({ state });
}
