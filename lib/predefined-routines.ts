export const predefinedRoutines = [
  {
    id: -1, // Usamos IDs negativos para evitar conflictos con las de la BD
    name: "Full Body - 3 Días (Principiante)",
    description:
      "Una rutina ideal para empezar, trabajando todo el cuerpo para construir una base sólida y ganar fuerza general.",
    content: `**Día 1:**\n- Sentadillas: 3x10\n- Press Banca: 3x10\n- Remo con Barra: 3x10\n- Press Militar: 3x12\n- Plancha: 3x30 segundos\n\n**Día 2 (descanso o cardio ligero)**\n\n**Día 3:**\n- Peso Muerto Rumano: 3x12\n- Flexiones: 3xAl fallo\n- Jalón al Pecho: 3x10\n- Elevaciones Laterales: 3x15\n- Abdominales: 3x15\n\n**Día 4 (descanso o cardio ligero)**\n\n**Día 5:**\n- Zancadas: 3x12 (por pierna)\n- Press Inclinado con Mancuernas: 3x12\n- Remo en Polea Baja: 3x12\n- Curl de Bíceps: 3x12\n- Extensiones de Tríceps: 3x12`,
    isPredefined: true,
  },
  {
    id: -2,
    name: "Push/Pull/Legs (PPL) - 6 Días",
    description:
      "Rutina clásica de alta frecuencia para hipertrofia, dividida en empuje, tirón y pierna. Para intermedios/avanzados.",
    content: `**Día 1: Empuje (Pecho, Hombro, Tríceps)**\n- Press Banca: 4x8\n- Press Inclinado con Mancuernas: 3x10\n- Press Militar: 3x10\n- Elevaciones Laterales: 4x12\n- Extensiones de Tríceps en Polea: 3x12\n\n**Día 2: Tirón (Espalda, Bíceps)**\n- Dominadas: 3xAl fallo\n- Remo con Barra: 4x8\n- Jalón al Pecho: 3x10\n- Face Pulls: 3x15\n- Curl de Bíceps con Barra: 3x10\n\n**Día 3: Pierna**\n- Sentadillas: 4x8\n- Prensa: 3x12\n- Extensiones de Cuádriceps: 3x15\n- Curl Femoral: 3x12\n- Elevación de Gemelos: 4x15`,
    isPredefined: true,
  },
  {
    id: -3,
    name: "Torso/Pierna - 4 Días",
    description:
      "Un balance perfecto entre frecuencia y volumen, ideal para ganancias de fuerza e hipertrofia en niveles intermedios.",
    content: `**Día 1: Torso (Fuerza)**\n- Press Banca: 5x5\n- Remo con Barra: 5x5\n- Press Militar: 3x8\n- Dominadas con lastre: 3x6-8\n\n**Día 2: Pierna (Fuerza)**\n- Sentadillas: 5x5\n- Peso Muerto: 1x5 (pesado)\n- Zancadas con mancuernas: 3x10\n- Elevación de Gemelos: 3x12\n\n**Día 3: Torso (Hipertrofia)**\n- Press Inclinado: 4x12\n- Jalón al Pecho: 4x12\n- Elevaciones Laterales: 4x15\n- Curl de Bíceps: 3x12\n- Extensiones de Tríceps: 3x12\n\n**Día 4: Pierna (Hipertrofia)**\n- Prensa: 4x15\n- Curl Femoral: 4x12\n- Extensiones de Cuádriceps: 4x15\n- Abductores en máquina: 3x20`,
    isPredefined: true,
  },
];