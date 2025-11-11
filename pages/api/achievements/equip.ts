import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { achievementId, equipped } = req.body;
  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Desequipa todos los logros del usuario
    await prisma.userAchievement.updateMany({
      where: { userId: user.id },
      data: { equipped: false },
    });

    // Equipa el logro seleccionado (si equipped es true)
    if (equipped) {
      await prisma.userAchievement.update({
        where: { userId_achievementId: { userId: user.id, achievementId: achievementId } },
        data: { equipped: true },
      });
    }

    return res.status(200).json({ message: "Achievement equipped successfully" });
  } catch (error) {
    console.error("Error equipping achievement:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
