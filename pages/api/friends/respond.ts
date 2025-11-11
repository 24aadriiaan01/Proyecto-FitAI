import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "No autenticado" });

  const { friendshipId, action } = req.body;
  if (!friendshipId || !["accept", "reject"].includes(action))
    return res.status(400).json({ message: "Datos inválidos" });

  // Buscar la solicitud
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    include: { receiver: true },
  });

  if (!friendship) return res.status(404).json({ message: "Solicitud no encontrada" });

  // Solo el receptor puede aceptar o rechazar
  if (friendship.receiver.email !== session.user.email)
    return res.status(403).json({ message: "No autorizado" });

  if (action === "accept") {
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "accepted" },
    });
    return res.json({ message: "Solicitud aceptada" });
  }

  // Rechazar
  await prisma.friendship.delete({ where: { id: friendshipId } });
  res.json({ message: "Solicitud rechazada" });
}
