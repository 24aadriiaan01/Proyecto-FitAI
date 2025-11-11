import type { NextApiRequest, NextApiResponse } from "next";
import { getAllAchievements, seedAchievementsIfNeeded } from "@/lib/achievements";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Método no permitido" });

  try {
    console.log("✅ API /api/achievements: Handler ejecutado."); // Línea de depuración
    await seedAchievementsIfNeeded(); // inicializa si no existen
    const all = await getAllAchievements();
    return res.status(200).json(all);
  } catch (err) {
    console.error("❌ Error al obtener logros:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
