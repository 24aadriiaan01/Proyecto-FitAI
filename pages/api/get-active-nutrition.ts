// /pages/api/get-active-nutrition.ts
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
    const active = await prisma.activeNutrition.findUnique({
      where: { userId: user.id },
      include: { nutrition: true }, // para traer los datos del plan
    });

    return res.status(200).json(active || {});
  } catch (error) {
    console.error("❌ Error al obtener nutrición activa:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}
