import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const payoutPeriodId = "7d788c72-adb6-4fcb-b729-a5157f64ece3";
const commissionRate = 15.0; // 15 percent

const rawData = [
  { name: "macaroni", gross: 79465000 },
  { name: "maki", gross: 76090000 },
  { name: "pablo", gross: 1110000 },
  { name: "xomi", gross: 0 },
  { name: "tookie", gross: 3150000 },
  { name: "drayven", gross: 1590000 },
  { name: "winz", gross: 4670000 },
  { name: "stevey", gross: 920000 },
  { name: "mazikeen", gross: 9680000 },
  { name: "carlos", gross: 1830000 },
  { name: "mel", gross: 7710000 },
  { name: "frensy", gross: 15080000 },
  { name: "reezy", gross: 7460000 },
  { name: "joko", gross: 21060000 },
  { name: "jied", gross: 22965000 },
  { name: "bros", gross: 1400000 },
  { name: "tupac", gross: 5500000 },
  { name: "sanzu", gross: 7550000 },
  { name: "kenji", gross: 6220000 },
  { name: "draco", gross: 15400000 },
  { name: "frank", gross: 7920000 },
  { name: "alisha", gross: 2219000 },
  { name: "dominic", gross: 2760000 },
  { name: "zeus", gross: 400000 },
  { name: "clara", gross: 4900000 },
  { name: "kimchi", gross: 2350000 },
  { name: "wangky", gross: 1900000 },
  { name: "pedrow", gross: 2260000 },
];

async function main() {
  console.log("Seeding salary records with 15% commission...");

  for (const item of rawData) {
    // 1. Hanapin o gawa ang employee
    let employee = await prisma.employee.findFirst({
      where: { name: { equals: item.name, mode: "insensitive" } },
    });

    if (!employee) {
      employee = await prisma.employee.create({
        data: { name: item.name },
      });
    }

    // 2. Compute 15% salary
    const salary = item.gross * 0.15;

    // 3. I-save o i-update ang SalaryRecord para sa payout period na ito
    await prisma.salaryRecord.create({
      data: {
        employeeId: employee.id,
        name: employee.name,
        grossEarnings: item.gross,
        commissionRate: commissionRate,
        salary: salary,
        payoutPeriodId: payoutPeriodId,
        isClaimed: false,
      },
    });

    console.log(
      `Inserted: ${item.name} -> Gross: ${item.gross} | Salary (15%): ${salary}`,
    );
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
