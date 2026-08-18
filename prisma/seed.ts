import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@gmail.com";

  const existingUser = await prisma.user.findUnique({
    where: {
      userEmail: adminEmail,
    },
  });

  if (existingUser) {
    console.log("⚠️ Admin account already exists. Skipping seed.");
    return;
  }

  const plainPassword = "testing123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.create({
    data: {
      userEmail: adminEmail,
      userPassword: hashedPassword,
      userContact: "09466753063",
    },
  });

  console.log("🌱 Database seeded successfully!");
  console.log(`👤 Created Admin Account: ${admin.userEmail}`);
  console.log(`🔑 Password: ${plainPassword}`);
}

main()
  .catch((error) => {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
