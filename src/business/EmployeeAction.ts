import prisma from "../utils/client";

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

  public static async create(name: string) {
    return await prisma.employee.create({
      data: {
        name: name.trim(),
      },
    });
  }

  public static async update(id: string, name: string) {
    return await prisma.employee.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });
  }

  public static async softDelete(id: string) {
    return await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
