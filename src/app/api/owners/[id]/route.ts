import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owner = await prisma.owner.findUnique({
    where: { id },
    include: { jobs: { include: { _count: { select: { assignments: true } } } } },
  });

  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(owner);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, age, address, phone } = body;

  const owner = await prisma.owner.update({
    where: { id },
    data: { name, age: age ? Number(age) : null, address, phone },
  });

  return NextResponse.json(owner);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.owner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
