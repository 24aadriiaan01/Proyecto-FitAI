import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        UserAchievement: {
          where: { equipped: true },
          include: { achievement: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.UserAchievement && user.UserAchievement.length > 0) {
      const equippedAchievement = user.UserAchievement[0].achievement;
      return res.status(200).json({
        id: equippedAchievement.id,
        name: equippedAchievement.name,
        icon: equippedAchievement.icon,
      });
    } else {
      return res.status(204).send(null); // No Content - No achievement equipped
    }
  } catch (error) {
    console.error("Error fetching equipped achievement:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
