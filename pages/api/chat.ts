import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: "Formato de conversación inválido." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        profile: true,
      },
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const profile = user.profile;
    const userProfileContext = profile
      ? `
El usuario tiene el siguiente perfil:
- Edad: ${profile.age ?? "no especificada"}
- Peso: ${profile.weight ?? "no especificado"} kg
- Altura: ${profile.height ?? "no especificada"} cm
- Objetivo: ${profile.goal ?? "no especificado"}
- Nivel: ${profile.level ?? "no especificado"}

Adapta tus respuestas de entrenamiento y nutrición a estos datos personales.
      `
      : `
El usuario no ha completado su perfil. 
Da respuestas genéricas, seguras y equilibradas, adaptadas a un nivel promedio.
      `;

    const history = user.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const memories = await prisma.userMemory.findMany({
      where: { userId: user.id },
    });

    const memoryFacts =
      memories.length > 0
        ? memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")
        : "El usuario aún no tiene información almacenada.";

    // 🧠 PROMPT AJUSTADO: enfoque en rutina o dieta sin consejos finales
    const allMessages = [
      {
        role: "system",
        content: `
Eres **FitAI**, un entrenador personal y nutricionista experto.

Responde SIEMPRE siguiendo estas reglas:
1. Si el usuario pide una **rutina de entrenamiento**:
   - Da una introducción breve (1 o 2 líneas máximo).
   - Luego presenta SOLO la rutina: días, grupos musculares, ejercicios, series y repeticiones.
   - No des consejos finales, advertencias ni frases motivacionales.
   - No incluyas calentamientos, descansos, ni texto extra salvo que el usuario lo pida explícitamente.

2. Si el usuario pide una **dieta o plan de nutrición**:
   - Da una breve introducción (1 línea máximo).
   - Luego lista las comidas (Desayuno, Almuerzo, Cena, Snacks, etc.) con alimentos, cantidades o calorías si es relevante.
   - No incluyas consejos, advertencias, ni mensajes motivacionales al final.

3. Responde siempre en español claro y usando formato **Markdown** limpio (listas y subtítulos).

---
🧠 **Datos del usuario:**
${userProfileContext}

🧩 **Memoria actual del usuario:**
${memoryFacts}
        `,
      },
      ...history,
      ...messages,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: allMessages,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0].message?.content ||
      "No tengo respuesta en este momento.";

    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.content) {
      await prisma.message.create({
        data: {
          role: "user",
          content: lastUserMessage.content,
          userId: user.id,
        },
      });
    }

    await prisma.message.create({
      data: {
        role: "assistant",
        content: reply,
        userId: user.id,
      },
    });

    try {
      const memoryPrompt = `
        A partir del siguiente mensaje del usuario, detecta si contiene información personal o relevante que FitAI debería recordar para futuras sesiones (por ejemplo: objetivos, hábitos, gustos, lesiones, horarios, etc.).
        Devuelve una lista JSON con pares clave-valor, por ejemplo:
        [{"key": "objetivo", "value": "ganar masa muscular"}]

        Mensaje del usuario: """${lastUserMessage?.content}"""
      `;

      const memoryAnalysis = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: memoryPrompt }],
      });

      const memoryText = memoryAnalysis.choices[0].message?.content?.trim();
      if (memoryText) {
        const newFacts = JSON.parse(memoryText);
        for (const fact of newFacts) {
          await prisma.userMemory.upsert({
            where: {
              userId_key: {
                userId: user.id,
                key: fact.key,
              },
            },
            update: { value: fact.value },
            create: { userId: user.id, key: fact.key, value: fact.value },
          });
        }
      }
    } catch (err) {
      console.warn("⚠️ No se pudo procesar la memoria:", err);
    }

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("❌ Error en /api/chat:", error);
    return res.status(500).json({ message: "Error al generar respuesta." });
  }
}
