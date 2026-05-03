import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const workers = status
    ? await prisma.$queryRaw`
        SELECT * FROM "Worker"
        WHERE status = ${status}::"WorkerStatus"
        ORDER BY
          regexp_replace(name, '[0-9]+$', '') ASC,
          CASE WHEN name ~ '[0-9]+' THEN (regexp_match(name, '[0-9]+'))[1]::int ELSE 0 END ASC
      `
    : await prisma.$queryRaw`
        SELECT * FROM "Worker"
        ORDER BY
          regexp_replace(name, '[0-9]+$', '') ASC,
          CASE WHEN name ~ '[0-9]+' THEN (regexp_match(name, '[0-9]+'))[1]::int ELSE 0 END ASC
      `;

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
