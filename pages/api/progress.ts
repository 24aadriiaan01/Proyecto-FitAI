import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkAndUnlockAchievements } from "@/lib/achievements"; // 1. Importamos la función de logros

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }, // Buena práctica: solo pedimos el ID
    });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    switch (req.method) {
      case "GET": {
        const progress = await prisma.progress.findMany({
          where: { userId: user.id },
          orderBy: { date: "asc" },
        });
        res.status(200).json(progress);
        break;
      }

      case "POST": {
        const { weight, height, notes } = req.body;

        const newProgress = await prisma.progress.create({
          data: {
            userId: user.id,
            date: new Date(), // 2. Añadimos la fecha actual al registro
            weight: parseFloat(weight),
            height: height ? parseFloat(height) : null,
            notes: notes || null,
          },
        });

        // 3. ¡Importante! Comprobamos si se desbloquea un logro
        await checkAndUnlockAchievements(user.id);

        res.status(201).json(newProgress); // Usamos 201 (Created) para nuevos recursos
        break;
      }

      case "DELETE": {
        const { id } = req.body;
        // 4. Añadimos seguridad: solo puede borrar sus propios registros
        await prisma.progress.delete({ where: { id: Number(id), userId: user.id } });
        res.status(204).end(); // Usamos 204 (No Content) para eliminaciones exitosas
        break;
      }

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("❌ Error en /api/progress:", error);
    return res.status(500).json({ message: "Error del servidor." });
  }
}
