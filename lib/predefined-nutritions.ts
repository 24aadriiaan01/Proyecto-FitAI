export const predefinedNutritions = [
  {
    id: -1, // Usamos IDs negativos para evitar conflictos con las de la BD
    name: "Plan Equilibrado - 2000 kcal",
    description: "Un plan de nutrición diario balanceado para mantenimiento o ligera pérdida de peso, con 2000 calorías.",
    content: `**Desayuno:**\n- Avena (50g) con leche (200ml), frutos rojos (100g) y un puñado de nueces.\n\n**Almuerzo:**\n- Yogur griego (150g) con fruta.\n\n**Comida:**\n- Ensalada grande con pollo a la plancha (150g), variedad de vegetales, aguacate (50g) y aderezo ligero.\n\n**Merienda:**\n- Puñado de almendras (30g).\n\n**Cena:**\n- Salmón al horno (150g) con boniato asado (150g) y brócoli al vapor (200g).`,
    isPredefined: true,
  },
  {
    id: -2,
    name: "Plan Hiperproteico - Ganancia Muscular",
    description: "Diseñado para apoyar el crecimiento muscular con un alto aporte de proteínas y calorías controladas.",
    content: `**Desayuno:**\n- Tortilla de 4 claras y 1 yema con espinacas y queso bajo en grasa.\n- Tostada integral con pavo (50g).\n\n**Almuerzo:**\n- Requesón (150g) con miel.\n\n**Comida:**\n- Arroz integral (100g cocido) con ternera magra (200g) y espárragos.\n\n**Merienda:**\n- Batido de proteínas con leche y plátano.\n\n**Cena:**\n- Pechuga de pollo (200g) con quinoa (80g cocida) y ensalada variada.`,
    isPredefined: true,
  },
  {
    id: -3,
    name: "Plan Vegetariano - Pérdida de Peso",
    description: "Un plan vegetariano bajo en calorías, rico en fibra y nutrientes para la pérdida de peso.",
    content: `**Desayuno:**\n- Batido verde (espinacas, plátano, leche de almendras, proteína vegetal).\n\n**Almuerzo:**\n- Manzana con crema de cacahuete (15g).\n\n**Comida:**\n- Lentejas estofadas (200g) con verduras (zanahoria, calabacín).\n\n**Merienda:**\n- Edamame (100g).\n\n**Cena:**\n- Tofu a la plancha (150g) con wok de vegetales (pimientos, cebolla, champiñones).`,
    isPredefined: true,
  },
];