import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { unlockAchievement } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";

/**
 * Desbloquea manualmente un logro (para pruebas o admin)
 * POST /api/achievements/unlock
 * body: { key: "trainer_constant_30" }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Método no permitido" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ message: "No autenticado" });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const { key } = req.body;
  if (!key) return res.status(400).json({ message: "Falta el campo 'key'" });

  try {
    const achievement = await prisma.achievement.findUnique({ where: { key } });
    if (!achievement)
      return res.status(404).json({ message: "Logro no encontrado" });

    await unlockAchievement(user.id, achievement.id);
    return res.status(200).json({ message: `🏆 Logro '${achievement.name}' desbloqueado` });
  } catch (err) {
    console.error("❌ Error al desbloquear logro:", err);
    return res.status(500).json({ message: "Error al desbloquear logro" });
  }
}
