// lib/achievements.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Lista base de achievements iniciales
 */
export const BUILT_IN_ACHIEVEMENTS = [
  {
    key: "strength_titanium",
    name: "Fuerza de Titanio",
    description: "Levantar tu récord personal en los principales ejercicios (press banca, sentadilla o peso muerto).",
    category: "physical",
    icon: "/images/fuerza-titaneo.png",
    rarity: "epic",
  },
  {
    key: "trainer_constant",
    name: "Entrenador Constante",
    description: "Completar entrenamientos sin interrupción durante 30 días seguidos.",
    category: "physical",
    icon: "/images/entrenador-constante.png",
    rarity: "rare",
  },
  {
    key: "heart_of_steel",
    name: "Corazón de Acero",
    description: "Correr o hacer cardio durante más de 10 horas acumuladas en un mes.",
    category: "physical",
    icon: "/images/corazon-acero.png",
    rarity: "rare",
  },
  {
    key: "mind_and_muscle",
    name: "Mente y Músculo",
    description: "Completar un reto físico que combine entrenamiento con enfoque mental (ej. yoga o meditación post-entreno).",
    category: "physical",
    icon: "/images/mente-musculo.png",
    rarity: "epic",
  },
  {
    key: "nutrition_expert",
    name: "Nutricionista Experto",
    description: "Seguir un plan de comidas saludable durante 30 días sin saltarse días.",
    category: "nutrition",
    icon: "/images/nutricionista-experto.png",
    rarity: "rare",
  },
  {
    key: "healthy_transformation",
    name: "Transformación Saludable",
    description: "Bajar un 5% de grasa corporal o mejorar composición corporal.",
    category: "nutrition",
    icon: "/images/transformacion-saludable.png",
    rarity: "epic",
  },
  {
    key: "chef_of_change",
    name: "Chef del Cambio",
    description: "Preparar tus propias comidas saludables durante una semana entera.",
    category: "nutrition",
    icon: "/images/chef-cambio.png",
    rarity: "common",
  },
  {
    key: "gym_legend",
    name: "Leyenda del Gimnasio",
    description: "Superar múltiples retos físicos con constancia y dedicación.",
    category: "physical",
    icon: "/images/leyenda-gimnasio.png",
    rarity: "legendary",
  },
  {
    key: "hero_path",
    name: "Camino del Héroe",
    description: "Completar tu primer año completo en la plataforma manteniendo progresos.",
    category: "social",
    icon: "/images/camino-heroe.png",
    rarity: "legendary",
  },
];

/**
 * Inserta los achievements base si no existen en la base de datos.
 */
export async function seedAchievementsIfNeeded() {
  for (const a of BUILT_IN_ACHIEVEMENTS) {
    try {
      await prisma.achievement.upsert({
        where: { key: a.key },
        update: {},
        create: {
          key: a.key,
          name: a.name,
          description: a.description,
          category: a.category,
          icon: a.icon,
          rarity: a.rarity,
        },
      });
    } catch (error) {
      console.error(`❌ Error al inicializar el logro '${a.key}':`, error);
    }
  }
}

/**
 * Comprueba y desbloquea logros automáticamente según las acciones del usuario.
 */
export async function checkAndUnlockAchievements(userId: string) {
  const [workoutSessions, foodLogs, progresses, owned, user] = await Promise.all([
    prisma.workoutSession.findMany({ where: { userId }, include: { exercises: true } }), // 'exercises' ahora es una lista de 'ExerciseLog'
    prisma.foodLog.findMany({ where: { userId }, select: { id: true, date: true, isHealthy: true, foodItem: true } }), // Incluimos foodItem para el logro 'Chef del Cambio'
    prisma.progress.findMany({ where: { userId }, orderBy: { date: "asc" } }), // Para el logro de transformación saludable
    prisma.userAchievement.findMany({ // Ahora también pedimos el estado 'equipped'
      where: { userId },
      select: { achievementId: true },
    }), // Keep this comma
    prisma.user.findUnique({ where: { id: userId }, include: { profile: { select: { createdAt: true } } } }),
  ]);

  const ownedSet = new Set(owned.map((o) => o.achievementId));

  // 1️⃣ Entrenador Constante (30 entrenamientos)
  const uniqueWorkoutDays = new Set(workoutSessions.map(s => new Date(s.date).toDateString()));
  if (uniqueWorkoutDays.size >= 30) {
    const ach = await prisma.achievement.findUnique({ where: { key: "trainer_constant" } });
    if (ach && !ownedSet.has(ach.id)) {
      await unlockAchievement(userId, ach.id);
    }
  }

  // 2️⃣ Transformación Saludable (bajar 2kg o más)
  if (progresses.length >= 2) {
    const first = progresses[0].weight;
    const last = progresses[progresses.length - 1].weight;
    if (first != null && last != null && first - last >= 2) {
      const ach = await prisma.achievement.findUnique({ where: { key: "healthy_transformation" } });
      if (ach && !ownedSet.has(ach.id)) {
        await unlockAchievement(userId, ach.id);
      }
    }
  }

  // 3️⃣ Nutricionista Experto (30 días de comidas saludables)
  const uniqueHealthyDays = new Set(foodLogs.filter(f => f.isHealthy).map(f => new Date(f.date).toDateString()));
  if (uniqueHealthyDays.size >= 30) {
    const ach = await prisma.achievement.findUnique({ where: { key: "nutrition_expert" } });
    if (ach && !ownedSet.has(ach.id)) {
      await unlockAchievement(userId, ach.id);
    }
  }

  // 4️⃣ Corazón de Acero (10 horas de cardio)
  let totalCardioMinutes = 0;
  workoutSessions.forEach(session => {
    session.exercises.forEach(ex => {
      // Si el ejercicio es cardio y tenemos un valor en repsAndWeight...
      if (ex.exerciseName.toLowerCase().includes('cardio') && ex.repsAndWeight) {
        // Extraemos solo el número del string (ej. "30 min" -> 30)
        const minutes = parseInt(ex.repsAndWeight, 10);
        if (!isNaN(minutes)) {
          totalCardioMinutes += minutes;
        }
      }
    });
  });
  if (totalCardioMinutes / 60 >= 10) {
    const ach = await prisma.achievement.findUnique({ where: { key: "heart_of_steel" } });
    if (ach && !ownedSet.has(ach.id)) {
      await unlockAchievement(userId, ach.id);
    }
  }

  // 5️⃣ Chef del Cambio (7 días de comidas registradas)
  const uniqueFoodDays = new Set(foodLogs.map(f => new Date(f.date).toDateString()));
  if (uniqueFoodDays.size >= 7) {
    const ach = await prisma.achievement.findUnique({ where: { key: "chef_of_change" } });
    if (ach && !ownedSet.has(ach.id)) {
      await unlockAchievement(userId, ach.id);
    }
  }

  // 6️⃣ Camino del Héroe (1 año en la plataforma)
  if (user?.profile?.createdAt) {
    const daysOnPlatform = (new Date().getTime() - new Date(user.profile.createdAt).getTime()) / (1000 * 3600 * 24);
    if (daysOnPlatform >= 365) {
      const ach = await prisma.achievement.findUnique({ where: { key: "hero_path" } });
      if (ach && !ownedSet.has(ach.id)) {
        await unlockAchievement(userId, ach.id);
      }
    }
  }
}

/**
 * Desbloquea un logro para un usuario (si no lo tiene ya)
 */
export async function unlockAchievement(userId: string, achievementId: number) {
  try {
    const created = await prisma.userAchievement.create({
      data: { userId, achievementId },
    });
    console.log(`🏆 Logro desbloqueado para ${userId}: ${achievementId}`);
    return created;
  } catch (err: any) {
    // Ignora errores si ya existe (P2002 = unique constraint)
    if (err.code === "P2002") return null;
    throw err;
  }
}

/**
 * Devuelve todos los logros existentes
 */
export async function getAllAchievements() {
  return prisma.achievement.findMany({
    orderBy: { id: "asc" },
  });
}

/**
 * Devuelve los logros de un usuario (con detalles)
 */
export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });
}

/*
/**
 * Devuelve TODOS los logros, enriquecidos con el progreso del usuario.
 * Ideal para la página de logros, donde se muestra todo.
 */
export async function getAchievementsWithProgress(userId: string) {
  console.log(`Obteniendo logros con progreso para el usuario ${userId}...`); // Keep this line
  // 1. Obtener todos los datos necesarios en paralelo
  const [allAchievements, userAchievements, workoutSessions, foodLogs, progresses, friendCount, user] = await Promise.all([
    getAllAchievements(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true, unlockedAt: true, equipped: true } }), // Obtenemos el achievementId, unlockedAt y equipped directamente
    prisma.workoutSession.findMany({ where: { userId }, include: { exercises: true } }), // 'exercises' ahora es una lista de 'ExerciseLog'
    prisma.foodLog.findMany({ where: { userId }, select: { id: true, date: true, isHealthy: true } }),
    prisma.progress.findMany({ where: { userId }, orderBy: { date: "asc" }, select: { weight: true } }),
    prisma.friendship.count({
      where: {
        OR: [{ requesterId: userId, status: "accepted" }, { receiverId: userId, status: "accepted" }],
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, include: { profile: { select: { createdAt: true } } } }),
  ]); // Se ha eliminado la variable friendCount de aquí.

  console.log("Datos obtenidos de la base de datos.");
  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, { unlockedAt: ua.unlockedAt, equipped: ua.equipped }])); // Esto ya está correcto

  // 2. Mapear cada logro y calcular su progreso
  const achievementsWithProgress = allAchievements.map((ach) => {
    let progress = 0;
    let target = 1; // Por defecto, para logros de una sola acción

    switch (ach.key) {
      case "trainer_constant":
        // Lógica anti-trampas: Contamos sesiones en días únicos
        const uniqueWorkoutDays = new Set(workoutSessions.map(s => new Date(s.date).toDateString()));
        progress = uniqueWorkoutDays.size;
        target = 30;
        break;
      
      case "healthy_transformation":
        if (progresses.length > 1) {
          const firstWeight = progresses[0].weight;
          const lastWeight = progresses[progresses.length - 1].weight;
          if (firstWeight && lastWeight) {
            progress = Math.max(0, firstWeight - lastWeight); // Aseguramos que no sea negativo
          }
        }
        target = 2; // Objetivo: Perder 2 kg
        break;

      case "active_community":
        progress = friendCount; // Progreso: número de amigos
        target = 1;
        break;

      case "nutrition_expert":
        // Contamos días únicos con comidas saludables registradas
        const uniqueHealthyDays = new Set(foodLogs.filter(f => f.isHealthy).map(f => new Date(f.date).toDateString()));
        progress = uniqueHealthyDays.size;
        target = 30; // Objetivo: 30 días/comidas
        break;

      case "heart_of_steel":
        let totalCardioMinutes = 0;
        workoutSessions.forEach(session => {
          session.exercises.forEach(ex => {
            // Corregido: Usar repsAndWeight para cardio
            if (ex.exerciseName.toLowerCase().includes('cardio') && ex.repsAndWeight) {
              const minutes = parseInt(ex.repsAndWeight, 10);
              if (!isNaN(minutes)) {
                totalCardioMinutes += minutes;
              }
            }
          });
        });
        progress = totalCardioMinutes / 60; // Progreso: horas de cardio
        target = 10; // Objetivo: 10 horas
        break;

      case "chef_of_change":
        const uniqueFoodDays = new Set(foodLogs.map(f => new Date(f.date).toDateString()));
        progress = uniqueFoodDays.size;
        target = 7; // Objetivo: 7 días/comidas
        break;

      case "hero_path": // Se ha corregido el acceso a createdAt
        if (user?.profile?.createdAt) {
          const daysOnPlatform = (new Date().getTime() - new Date(user.profile.createdAt).getTime()) / (1000 * 3600 * 24);
          progress = Math.floor(daysOnPlatform); // Progreso: días en la plataforma
        }
        target = 365; // Objetivo: 365 días
        break;
    }

    return {
      ...ach,
      unlocked: unlockedMap.has(ach.id),
      equipped: unlockedMap.get(ach.id)?.equipped ?? false, // Añadimos el estado 'equipped'
      progress: Math.min(progress, target), // El progreso no puede superar el objetivo
      target,
    };
  });

  console.log("Logros enriquecidos con el progreso:", achievementsWithProgress); // Keep this line.
  return achievementsWithProgress; // Keep this line.
}
