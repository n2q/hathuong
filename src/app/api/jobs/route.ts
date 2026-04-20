import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const jobs = await prisma.job.findMany({
    where: status ? { status: status as "ACTIVE" | "COMPLETED" | "CANCELLED" } : undefined,
    orderBy: { startDate: "desc" },
    include: {
      owner: true,
      _count: { select: { assignments: true } },
    },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, location, startDate, endDate, ownerRate, workerRate, ownerId, status } = body;

  if (!name || !ownerId || !startDate || !ownerRate || !workerRate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      name,
      description,
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      ownerRate: Number(ownerRate),
      workerRate: Number(workerRate),
      ownerId,
      status: status || "ACTIVE",
    },
    include: { owner: true },
  });

  return NextResponse.json(job, { status: 201 });
}
