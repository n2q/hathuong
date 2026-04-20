import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const periodStart = from ? new Date(from) : new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = to ? new Date(to) : today;

  const [
    workingToday,
    scheduledTomorrow,
    activeJobs,
    periodTimesheets,
    totalWorkers,
    totalOwners,
    periodExpenses,
  ] = await Promise.all([
    prisma.timesheet.count({
      where: { date: today, status: "PRESENT" },
    }),
    prisma.assignment.count({
      where: {
        job: { status: "ACTIVE", startDate: { lte: tomorrow }, endDate: { gte: tomorrow } },
      },
    }),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.timesheet.findMany({
      where: {
        date: { gte: periodStart, lte: periodEnd },
        status: "PRESENT",
      },
      include: {
        assignment: { include: { job: true } },
      },
    }),
    prisma.worker.count({ where: { status: "ACTIVE" } }),
    prisma.owner.count(),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: periodStart, lte: periodEnd } },
    }),
  ]);

  let totalRevenue = 0;
  let totalCost = 0;
  for (const ts of periodTimesheets) {
    totalRevenue += Number(ts.assignment.job.ownerRate);
    totalCost += Number(ts.assignment.job.workerRate);
  }

  const totalExpenses = Number(periodExpenses._sum.amount ?? 0);
  const grossProfit = totalRevenue - totalCost;

  return NextResponse.json({
    workingToday,
    scheduledTomorrow,
    activeJobs,
    totalRevenue,
    totalCost,
    totalExpenses,
    totalProfit: grossProfit,
    netProfit: grossProfit - totalExpenses,
    totalWorkers,
    totalOwners,
  });
}
