import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, type, message } = req.body;

  if (!name || !email || !type || !message) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: { name, email, type, message },
    });
    res.status(201).json({ message: 'Feedback recibido con éxito.', feedback });
  } catch (error) {
    console.error('Error al guardar el feedback:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}