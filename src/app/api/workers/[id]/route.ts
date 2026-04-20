import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          job: { include: { owner: true } },
          timesheets: { orderBy: { date: "desc" } },
        },
      },
    },
  });

  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(worker);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, age, address, phone, status } = body;

  const worker = await prisma.worker.update({
    where: { id },
    data: { name, age: age ? Number(age) : null, address, phone, status },
  });

  return NextResponse.json(worker);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.worker.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
