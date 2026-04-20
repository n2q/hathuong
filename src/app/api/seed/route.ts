import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@hathuong.com" } });
  if (existing) return NextResponse.json({ message: "Already seeded" });

  const password = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: { email: "admin@hathuong.com", password, name: "Admin" },
  });

  return NextResponse.json({ message: "Seeded successfully", email: "admin@hathuong.com", password: "admin123" });
}
