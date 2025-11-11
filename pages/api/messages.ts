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

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.status(200).json({ messages: user.messages });
  } catch (error) {
    console.error("❌ Error en /api/messages:", error);
    return res.status(500).json({ message: "Error al obtener historial." });
  }
}
