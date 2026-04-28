import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (jobId) {
    const activeWorkers = await prisma.worker.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    await Promise.all(
      activeWorkers.map((w) =>
        prisma.assignment.upsert({
          where: { jobId_workerId: { jobId, workerId: w.id } },
          create: { jobId, workerId: w.id },
          update: {},
        })
      )
    );
  }

  const assignments = await prisma.assignment.findMany({
    where: jobId ? { jobId, worker: { status: "ACTIVE" } } : undefined,
    include: {
      worker: true,
      job: { include: { owner: true } },
    },
  });

  return NextResponse.json(assignments);
}
