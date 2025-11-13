import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Server } from "socket.io"; // Importamos el tipo Server para mayor seguridad

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

      // Acceder a la instancia de Socket.io y emitir el nuevo mensaje
      // La instancia de io se adjunta al servidor HTTP en pages/api/socket.ts
      const io = (res.socket as any)?.server?.io as Server;

      if (io) {
        // Crear un ID de sala consistente para el chat directo
        // Esto asegura que ambos usuarios (sender y receiver) estén en la misma sala
        const chatRoomId = [currentUser.id, friendId].sort().join('-');
        
        // Emitir el nuevo mensaje a la sala de chat
        // El evento 'receive_message' debe ser escuchado por los clientes en esa sala
        io.to(chatRoomId).emit("receive_message", newMessage);
        console.log(`[Socket.io] Mensaje emitido a la sala ${chatRoomId}:`, newMessage.id);
      } else {
        console.warn("[Socket.io] Servidor Socket.io no disponible para actualización en tiempo real.");
      }

      return res.status(200).json(newMessage);
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error("❌ Error en chat API:", err);
    return res.status(500).json({ error: "Error del servidor" });
  }
}
