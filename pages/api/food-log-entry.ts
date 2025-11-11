import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkAndUnlockAchievements } from "@/lib/achievements";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { foodItem, isHealthy, mealType } = req.body;

  if (!foodItem || !mealType) {
    return res.status(400).json({ message: "Food item and meal type are required." });
  }

  try {
    const foodLogEntry = await prisma.foodLog.create({
      data: {
        userId: user.id,
        date: new Date(), // Fecha actual del registro
        foodItem: foodItem,
        isHealthy: isHealthy || false,
        mealType: mealType,
      },
    });

    // Comprobar y desbloquear logros después de registrar la comida
    await checkAndUnlockAchievements(user.id);

    return res.status(201).json(foodLogEntry);
  } catch (error) {
    console.error("Error logging food entry:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}