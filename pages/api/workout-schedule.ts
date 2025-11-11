import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "No autenticado" });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  try {
    if (req.method === "GET") {
      const data = await prisma.workoutSchedule.findMany({
        where: { userId: user.id },
        orderBy: { day: "asc" },
      });
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { day, routine } = req.body;
      const schedule = await prisma.workoutSchedule.create({
        data: { userId: user.id, day, routine },
      });
      return res.status(200).json(schedule);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await prisma.workoutSchedule.delete({ where: { id: Number(id) } });
      return res.status(200).json({ message: "Eliminado correctamente" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("❌ Error en /api/workout-schedule:", error);
    return res.status(500).json({ message: "Error en el servidor." });
  }
}
