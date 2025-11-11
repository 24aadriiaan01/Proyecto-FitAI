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

  const { routineId } = req.body;
  if (!routineId) return res.status(400).json({ message: "Falta el ID de rutina" });

  try {
    // Si ya hay una rutina activa, reemplázala
    await prisma.activeRoutine.upsert({
      where: { userId: user.id },
      update: { routineId },
      create: { userId: user.id, routineId },
    });

    return res.status(200).json({ message: "Rutina activada correctamente" });
  } catch (error) {
    console.error("❌ Error al activar rutina:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}
