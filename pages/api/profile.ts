import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuración multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "No autenticado" });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  // ✅ GET → obtener perfil completo
  if (req.method === "GET") {
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    return res.status(200).json(profile);
  }

  // ✅ POST → actualizar o crear perfil
  if (req.method === "POST" || req.method === "PUT") {
    return new Promise((resolve) => {
      upload.single("image")(req as any, res as any, async (err: any) => {
        if (err) {
          console.error("Error al subir imagen:", err);
          res.status(500).json({ message: "Error al subir imagen" });
          return resolve(null);
        }

        const file = (req as any).file;
        const body: any = (req as any).body;

        const data = {
          age: body.age ? parseInt(body.age) : null,
          weight: body.weight ? parseFloat(body.weight) : null,
          height: body.height ? parseFloat(body.height) : null,
          goal: body.goal || null,
          level: body.level || null,
          bio: body.bio || null,
          socials: body.socials ? JSON.parse(body.socials) : null,
          image: file ? `/uploads/avatars/${file.filename}` : undefined,
        };

        const profile = await prisma.userProfile.upsert({
          where: { userId: user.id },
          update: data,
          create: { userId: user.id, ...data },
        });

        res.status(200).json(profile);
        resolve(null);
      });
    });
  }

  return res.status(405).json({ message: "Método no permitido" });
}
