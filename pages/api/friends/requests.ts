import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "No autenticado" });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const requests = await prisma.friendship.findMany({
    where: {
      OR: [{ receiverId: user.id }, { requesterId: user.id }],
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { image: true } }, // ✅ Incluir la imagen del perfil
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { image: true } }, // ✅ Incluir la imagen del perfil
        },
      },
    },
  });

  res.json(requests);
}
