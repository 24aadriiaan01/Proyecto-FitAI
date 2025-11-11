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

  const { exerciseName, muscleGroup, repsAndWeight } = req.body; // Cambiado de durationMinutes a repsAndWeight

  if (!exerciseName || !muscleGroup || !repsAndWeight) { // Actualizada la validación
    return res.status(400).json({ message: "Exercise name, muscle group, and reps/weight are required." });
  }

  try {
    // Crear una nueva sesión de entrenamiento
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        date: new Date(), // Fecha actual del registro
        exercises: {
          create: {
            exerciseName: exerciseName,
            muscleGroup: muscleGroup || null, // Guardar el grupo muscular si se proporciona
            // durationMinutes: durationMinutes, // Ya no se usa
            repsAndWeight: repsAndWeight, // Nuevo campo
          },
        },
      },
      include: { exercises: true },
    });

    // Comprobar y desbloquear logros después de registrar el entrenamiento
    await checkAndUnlockAchievements(user.id);

    return res.status(201).json(workoutSession);
  } catch (error) {
    console.error("Error logging workout session:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}