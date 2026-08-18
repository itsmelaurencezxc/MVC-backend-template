import prisma from "../utils/client";
import { fetchDiscordProfile } from "../config/services/DiscordService"; // I-adjust ang path kung saan nakalagay ang service mo

export class EmployeeAction {
  public static async getAll() {
    return await prisma.employee.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  public static async getById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee || employee.deletedAt) {
      throw new Error("Employee not found");
    }

    return employee;
  }

  // UPDATED: Kasama na ang role sa pag-create
  public static async create(name: string, discordId?: string, role?: any) {
    return await prisma.employee.create({
      data: {
        name: name.trim(),
        discordId: discordId?.trim() || null,
        role: role || "TRAINEE", // Default to TRAINEE kung walang pasa
      },
    });
  }

  public static async update(
    id: string,
    name: string,
    discordId?: string,
    role?: any,
  ) {
    return await prisma.employee.update({
      where: { id },
      data: {
        name: name.trim(),
        discordId: discordId?.trim() || null,
        role: role,
      },
    });
  }

  public static async softDelete(id: string) {
    return await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // BAGONG FUNCTION: Kunin ang buong team na may live Discord details at role
  public static async getTeamMembersWithDiscord() {
    // 1. Kunin lahat ng empleyado na active
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });

    const teamList = [];

    // 2. Isa-isahin sila para kunin ang live Discord profile
    for (const emp of employees) {
      let discordData = { username: "N/A", avatar: "", banner: "" };

      if (emp.discordId) {
        const profile = await fetchDiscordProfile(emp.discordId);
        if (profile) {
          discordData = profile; // Hihilahin ang live username, avatar, at banner
        }
      }

      // 3. I-push sa listahan kasama ang kanilang role
      teamList.push({
        id: emp.id,
        name: emp.name,
        role: emp.role, // TRAINEE, SENIOR, HR, SECRETARY, OWNER
        discord: discordData, // Live avatar, banner, at username
      });
    }

    return teamList;
  }
}
