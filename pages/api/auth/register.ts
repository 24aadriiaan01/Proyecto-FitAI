import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Crear un perfil de usuario por defecto junto con el usuario
        profile: {
          create: {
            // Aquí puedes establecer valores por defecto para un nuevo perfil
            age: null,
            weight: null,
            height: null,
            goal: "No especificado",
            level: "principiante",
            bio: "¡Hola! Soy nuevo en FitAI.",
            image: "/images/defaults/avatar1.png", // Asegúrate de que esta ruta sea válida
            socials: {
              instagram: "", x: "", youtube: ""
            }
          },
        },
      },
    });

    return res.status(201).json({ message: "Usuario creado con éxito", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}
