import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  const assignments = await prisma.assignment.findMany({
    where: jobId ? { jobId } : undefined,
    include: {
      worker: true,
      job: { include: { owner: true } },
    },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { jobId, workerIds } = body;

  if (!jobId || !workerIds?.length) {
    return NextResponse.json({ error: "jobId and workerIds are required" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    workerIds.map((workerId: string) =>
      prisma.assignment.upsert({
        where: { jobId_workerId: { jobId, workerId } },
        create: { jobId, workerId },
        update: {},
        include: { worker: true },
      })
    )
  );

  const created = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<unknown>).value);

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { jobId, workerId } = body;

  await prisma.assignment.delete({
    where: { jobId_workerId: { jobId, workerId } },
  });

  return NextResponse.json({ success: true });
}
