import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "No autenticado" });

  const { receiverId } = req.body;
  if (!receiverId) return res.status(400).json({ message: "Falta el ID del receptor" });

  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester) return res.status(404).json({ message: "Usuario no encontrado" });

  // 1. No puedes enviarte una solicitud a ti mismo
  if (requester.id === receiverId) {
    return res.status(400).json({ message: "No puedes agregarte a ti mismo." });
  }

  // 2. Comprobar si ya existe una amistad o solicitud pendiente
  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: requester.id, receiverId: receiverId },
        { requesterId: receiverId, receiverId: requester.id },
      ],
    },
  });

  if (existingFriendship) {
    return res.status(409).json({ message: "Ya existe una solicitud o amistad con este usuario." });
  }

  await prisma.friendship.create({
    data: {
      requesterId: requester.id,
      receiverId,
      status: "pending",
    },
  });

  res.json({ message: "Solicitud enviada" });
}
