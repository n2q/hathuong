import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owners = await prisma.owner.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: true } } },
  });

  return NextResponse.json(owners);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, age, address, phone } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const owner = await prisma.owner.create({
    data: { name, age: age ? Number(age) : null, address, phone },
  });

  return NextResponse.json(owner, { status: 201 });
}
