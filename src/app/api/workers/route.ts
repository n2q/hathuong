import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const workers = await prisma.worker.findMany({
    where: status ? { status: status as "ACTIVE" | "INACTIVE" } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { assignments: true } } },
  });

  return NextResponse.json(workers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, age, address, phone, status } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const worker = await prisma.worker.create({
    data: { name, age: age ? Number(age) : null, address, phone, status: status || "ACTIVE" },
  });

  return NextResponse.json(worker, { status: 201 });
}
