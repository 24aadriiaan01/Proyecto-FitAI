import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const config = {
  api: { bodyParser: false },
};

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ error: "No autenticado" });

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser)
    return res.status(401).json({ error: "Usuario no encontrado" });

  const friendId = String(req.query.id);

  try {
    if (req.method === "GET") {
      const messages = await prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: friendId },
            { senderId: friendId, receiverId: currentUser.id },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
      return res.status(200).json(messages);
    }

    if (req.method === "POST") {
      await runMiddleware(req, res, upload.single("image"));

      const content = (req.body.content as string) || "";
      const file = (req as any).file;

      if (!content.trim() && !file)
        return res.status(400).json({ error: "Mensaje vacío" });

      let imageUrl: string | null = null;
      if (file) {
        imageUrl = `/uploads/chat/${file.filename}`;
      }

      const newMessage = await prisma.directMessage.create({
        data: {
          content: content || "",
          senderId: currentUser.id,
          receiverId: friendId,
          image: imageUrl,
        },
      });

      return res.status(200).json(newMessage);
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error("❌ Error en chat API:", err);
    return res.status(500).json({ error: "Error del servidor" });
  }
}
