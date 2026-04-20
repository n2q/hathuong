import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const date = searchParams.get("date");

  const timesheets = await prisma.timesheet.findMany({
    where: {
      ...(date ? { date: new Date(date) } : {}),
      ...(jobId ? { assignment: { jobId } } : {}),
    },
    include: {
      assignment: {
        include: {
          worker: true,
          job: { include: { owner: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(timesheets);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { entries } = body;
  // entries: [{ assignmentId, date, status }]

  if (!entries?.length) {
    return NextResponse.json({ error: "entries array is required" }, { status: 400 });
  }

  const results = await Promise.all(
    entries.map(({ assignmentId, date, status }: { assignmentId: string; date: string; status: string }) =>
      prisma.timesheet.upsert({
        where: { assignmentId_date: { assignmentId, date: new Date(date) } },
        create: { assignmentId, date: new Date(date), status: status as "PRESENT" | "ABSENT" },
        update: { status: status as "PRESENT" | "ABSENT" },
      })
    )
  );

  return NextResponse.json(results);
}
