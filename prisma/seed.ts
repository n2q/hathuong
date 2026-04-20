import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@hathuong.com" } });
  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const password = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: { email: "admin@hathuong.com", password, name: "Admin" },
  });

  console.log("✅ Seeded: admin@hathuong.com / admin123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
