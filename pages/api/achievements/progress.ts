// pages/api/achievements/progress.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getAchievementsWithProgress } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";

/**
 * Devuelve todos los logros con el progreso del usuario actual.
 * GET /api/achievements/progress
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    console.log("Obteniendo usuario desde la sesión...");
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const achievements = await getAchievementsWithProgress(user.id);
    console.log("Logros obtenidos con éxito:", achievements);
    return res.status(200).json(achievements);
  } catch (error) {
    console.error("❌ Error al obtener el progreso de los logros:", error);
    let errorMessage = "Error desconocido al obtener el progreso de los logros.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
      errorMessage = (error as any).message;
    }
    // Enviar el error al cliente
    return res.status(500).json({ message: "Error interno del servidor", error: errorMessage });
  }
}
