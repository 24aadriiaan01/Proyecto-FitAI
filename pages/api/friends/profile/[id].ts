import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "No autenticado" });

  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ message: "ID de usuario no proporcionado" });

  const friend = await prisma.user.findUnique({
    where: { id },
    select: { // Cambiamos a 'select' para controlar exactamente qué datos enviamos
      id: true,
      name: true,
      email: true,
      profile: { // ✅ Incluimos el perfil completo del usuario
        select: {
          image: true,
          age: true,
          weight: true,
          height: true,
          goal: true,
          level: true,
          bio: true,
          socials: true,
        },
      },
      // 🏆 Incluimos el logro equipado
      UserAchievement: {
        where: { equipped: true },
        select: {
          achievement: {
            select: {
              icon: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!friend) return res.status(404).json({ message: "Amigo no encontrado" });

  // Mapeamos el resultado para que sea más fácil de usar en el frontend
  const equippedAchievement = friend.UserAchievement.length > 0 ? friend.UserAchievement[0].achievement : null;
  const responseData = { ...friend, equippedAchievement };

  res.json(responseData);
}