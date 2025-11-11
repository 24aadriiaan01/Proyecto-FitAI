import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  try {
    if (req.method === "POST") {
      const { name, description, content } = req.body;
      const nutrition = await prisma.nutritionPlan.create({
        data: {
          name,
          description,
          content,
          userId: user.id,
        },
      });
      return res.status(200).json(nutrition);
    }

    if (req.method === "GET") {
      const nutritions = await prisma.nutritionPlan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(nutritions);
    }

    res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("❌ Error en /api/nutritions:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
}
