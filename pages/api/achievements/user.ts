import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUserAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ message: "No autenticado" });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  try {
    const achievements = await getUserAchievements(user.id);
    return res.status(200).json(achievements);
  } catch (err) {
    console.error("❌ Error al obtener logros del usuario:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
