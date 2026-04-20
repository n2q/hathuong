import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "worker";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const today = new Date();
  const periodStart = from ? new Date(from) : new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = to ? new Date(to) : today;

  const dateFilter = { date: { gte: periodStart, lte: periodEnd }, status: "PRESENT" as const };

  if (type === "worker") {
    const workers = await prisma.worker.findMany({
      include: {
        assignments: {
          include: {
            job: true,
            timesheets: { where: dateFilter },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const report = workers.map((w) => {
      let daysWorked = 0;
      let totalEarnings = 0;
      for (const a of w.assignments) {
        daysWorked += a.timesheets.length;
        totalEarnings += a.timesheets.length * Number(a.job.workerRate);
      }
      return { id: w.id, name: w.name, phone: w.phone, daysWorked, totalEarnings };
    });

    return NextResponse.json(report);
  }

  if (type === "job") {
    const jobs = await prisma.job.findMany({
      include: {
        owner: true,
        assignments: {
          include: {
            timesheets: { where: dateFilter },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const report = jobs.map((j) => {
      let totalWorkerDays = 0;
      for (const a of j.assignments) totalWorkerDays += a.timesheets.length;
      const revenue = totalWorkerDays * Number(j.ownerRate);
      const cost = totalWorkerDays * Number(j.workerRate);
      return {
        id: j.id,
        name: j.name,
        ownerName: j.owner.name,
        location: j.location,
        status: j.status,
        totalWorkerDays,
        revenue,
        cost,
        profit: revenue - cost,
      };
    });

    return NextResponse.json(report);
  }

  if (type === "owner") {
    const owners = await prisma.owner.findMany({
      include: {
        jobs: {
          include: {
            assignments: {
              include: {
                timesheets: { where: dateFilter },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const report = owners.map((o) => {
      let totalWorkerDays = 0;
      let totalOwed = 0;
      for (const j of o.jobs) {
        for (const a of j.assignments) {
          totalWorkerDays += a.timesheets.length;
          totalOwed += a.timesheets.length * Number(j.ownerRate);
        }
      }
      return { id: o.id, name: o.name, phone: o.phone, totalWorkerDays, totalOwed };
    });

    return NextResponse.json(report);
  }

  return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
}
