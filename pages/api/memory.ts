import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "No autenticado" });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  try {
    if (req.method === "GET") {
      const memories = await prisma.userMemory.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });
      return res.status(200).json(memories);
    }

    if (req.method === "POST") {
      const { key, value } = req.body;
      const memory = await prisma.userMemory.create({
        data: { userId: user.id, key, value },
      });
      return res.status(200).json(memory);
    }

    if (req.method === "PUT") {
      const { id, value } = req.body;
      const updated = await prisma.userMemory.update({
        where: { id },
        data: { value },
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await prisma.userMemory.delete({
        where: { id: Number(id) },
      });
      return res.status(200).json({ message: "Eliminado correctamente" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("❌ Error en /api/memory:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}
