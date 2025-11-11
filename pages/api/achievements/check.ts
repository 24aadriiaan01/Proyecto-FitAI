import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";

/**
 * Fuerza la comprobación de logros del usuario autenticado.
 * Ejemplo: POST /api/achievements/check
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

  try {
    await checkAndUnlockAchievements(user.id);
    return res.status(200).json({ message: "✔ Logros comprobados y actualizados" });
  } catch (err) {
    console.error("❌ Error al comprobar logros:", err);
    return res.status(500).json({ message: "Error al verificar logros" });
  }
}
