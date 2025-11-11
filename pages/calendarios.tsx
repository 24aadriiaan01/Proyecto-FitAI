"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addDays,
  startOfMonth,
  getDay,
  endOfMonth,
  isToday,
} from "date-fns";
import { predefinedRoutines } from "@/lib/predefined-routines";
import { es } from "date-fns/locale";

// Tipos
type WorkoutScheduleItem = {
  id: number;
  userId: string;
  day: string;
  routine: string;
  createdAt: string;
  updatedAt: string;
};

type NutritionScheduleItem = {
  id: number;
  userId: string;
  day: string;
  meal: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
};

type ActiveRoutine = {
  routine: { id: string; name: string; description: string };
};

type ActiveNutrition = {
  nutrition: { id: string; name: string; description: string };
};

// Interfaz para la rutina parseada
interface ParsedRoutineDay {
  dayName: string; // No estrictamente necesario para el mapeo, pero útil
  exercises: string[];
}

export default function CalendariosPage() {
  const [workouts, setWorkouts] = useState<WorkoutScheduleItem[]>([]);
  const [nutrition, setNutrition] = useState<NutritionScheduleItem[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(
    null
  );
  const [activeNutrition, setActiveNutrition] =
    useState<ActiveNutrition | null>(null);
  const [parsedActiveRoutine, setParsedActiveRoutine] = useState<Map<number, string[]>>(new Map());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [popoverData, setPopoverData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    exercises: string[];
  }>({ visible: false, x: 0, y: 0, exercises: [] });
  const [newWorkout, setNewWorkout] = useState({
    day: "Lunes",
    muscle: "Pecho",
    exercises: "",
  });
  const [newNutrition, setNewNutrition] = useState({
    day: "Lunes",
    meal: "Desayuno",
    plan: "",
  });

  useEffect(() => {
    fetchData();
    // Cargar rutina activa
    fetch("/api/get-active-routine")
      .then((r) => r.json())
      .then((activeRoutineData) => {
        let routineDetails = null;
        if (activeRoutineData?.routineId < 0) {
          // Es una rutina predefinida, la buscamos localmente
          routineDetails = predefinedRoutines.find(
            (r) => r.id === activeRoutineData.routineId
          );
        } else if (activeRoutineData?.routine) {
          // Es una rutina de usuario, la API ya nos la devuelve
          routineDetails = activeRoutineData.routine;
        }

        if (routineDetails) {
          setActiveRoutine({ routine: routineDetails });
          setParsedActiveRoutine(parseRoutineContent(routineDetails.content));
        } else {
          setActiveRoutine(null);
          setParsedActiveRoutine(new Map());
        }
      });
    fetch("/api/get-active-nutrition")
      .then((r) => r.json())
      .then(setActiveNutrition);
  }, []);

  async function fetchData() {
    fetch("/api/workout-schedule")
      .then((res) => res.json())
      .then(setWorkouts);
    fetch("/api/nutrition-schedule")
      .then((res) => res.json())
      .then(setNutrition);
  }

  async function handleAddWorkout() {
    if (!newWorkout.day || !newWorkout.muscle || !newWorkout.exercises) return;
    const routineText = `${newWorkout.muscle}: ${newWorkout.exercises}`;
    const res = await fetch("/api/workout-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: newWorkout.day, routine: routineText }),
    });
    const added = await res.json();
    setWorkouts([...workouts, added]);
    setNewWorkout({ day: "Lunes", muscle: "Pecho", exercises: "" });
  }

  async function handleAddNutrition() {
    if (!newNutrition.day || !newNutrition.meal || !newNutrition.plan) return;
    const res = await fetch("/api/nutrition-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNutrition),
    });
    const added = await res.json();
    setNutrition([...nutrition, added]);
    setNewNutrition({ day: "Lunes", meal: "Desayuno", plan: "" });
  }

  async function handleDeleteItem(type: "workout" | "nutrition", id: number) {
    const endpoint =
      type === "workout" ? "/api/workout-schedule" : "/api/nutrition-schedule";
    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (type === "workout") setWorkouts(workouts.filter((w) => w.id !== id));
    else setNutrition(nutrition.filter((n) => n.id !== id));
  }

  // === Iconos ===
  const IconDumbbell = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 7h-1.5v10H21a1 1 0 001-1V8a1 1 0 00-1-1zM4 7H2a1 1 0 00-1 1v8a1 1 0 001 1h2V7z"
        fill="currentColor"
      />
      <path d="M7 9h10v6H7z" fill="currentColor" />
    </svg>
  );

  const IconSalad = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12c0-4 4-7 9-7s9 3 9 7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 21v-6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );

  const IconPlus = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const IconTrash = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Función para parsear el contenido de la rutina en Markdown
  function parseRoutineContent(content: string): Map<number, string[]> {
    const routineMap = new Map<number, string[]>();
    const lines = content.split('\n');
    let currentDay = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const dayMatch = trimmedLine.match(/^\*\*Día (\d+):?\*\*/); // Busca "**Día X:**"

      if (dayMatch && dayMatch[1]) {
        currentDay = parseInt(dayMatch[1], 10);
        routineMap.set(currentDay, []);
      } else if (trimmedLine.startsWith('- ') && currentDay > 0) {
        // Si es una línea de ejercicio y estamos dentro de un día
        const exercises = routineMap.get(currentDay);
        if (exercises) {
          exercises.push(trimmedLine.substring(2)); // Añade el ejercicio sin el "- "
        }
      }
    }
    return routineMap;
  }


  // === Calendario ===
  const start = startOfMonth(currentMonth);
  const firstDayOfWeek = getDay(start) === 0 ? 6 : getDay(start) - 1;
  const end = endOfMonth(currentMonth);
  const daysInMonth = Array.from({ length: end.getDate() }, (_, i) =>
    addDays(start, i)
  );
  const weekDayNames = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const muscleGroups = [
    "Pecho",
    "Hombro",
    "Triceps",
    "Espalda",
    "Biceps",
    "Piernas",
    "Abdominal",
  ];
  const mealTypes = [
    "Desayuno",
    "Almuerzo",
    "Comida",
    "Merienda",
    "Cena",
    "Snack",
  ];

  // Helper para mapear el día de la semana (0=Dom, 1=Lun...) al número de día de la rutina (1-indexado)
  const getRoutineDayNumber = (dayOfWeek: number): number => {
    // Asumiendo que el "Día 1" de la rutina es Lunes, "Día 2" es Martes, etc.
    // date-fns getDay devuelve 0 para Domingo, 1 para Lunes, ..., 6 para Sábado
    if (dayOfWeek === 0) return 7; // Domingo es el día 7 de la rutina
    return dayOfWeek; // Lunes es 1, Martes es 2, etc.
  };

  const getDayContent = (day: Date) => {
    const formatted = format(day, "EEEE", { locale: es });
    const dayOfWeekIndex = getDay(day); // 0 for Sunday, 1 for Monday

    const workoutsToday = workouts.filter(
      (w) => w.day.toLowerCase() === formatted.toLowerCase()
    );
    const mealsToday = nutrition.filter(
      (n) => n.day.toLowerCase() === formatted.toLowerCase()
    );

    const routineDayNum = getRoutineDayNumber(dayOfWeekIndex);
    const activeRoutineExercises = parsedActiveRoutine.get(routineDayNum) || [];
    return { workoutsToday, mealsToday, activeRoutineExercises };
  };

  const resumenSemanal = {
    entrenamientos: workouts.length,
    comidas: nutrition.length,
    diasActivos: new Set([
      ...workouts.map((w) => w.day),
      ...nutrition.map((n) => n.day),
    ]).size,
  };

  return (
    <div className="relative min-h-screen">
      {/* Fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/images/gym-bg.png')", // recuerda: sin /public
        }}
      ></div>

      {/* Overlay ligeramente más oscuro y con menos blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-[1px]"></div>

      {/* Contenido principal */}
      <div className="relative z-10 py-12 px-4 max-w-6xl mx-auto space-y-12">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]">
            FitAI · Panel de Calendarios
          </h1>
          <p className="text-sm text-gray-200 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            Tu organización fitness centralizada
          </p>
        </motion.header>

        {/* RUTINA + NUTRICIÓN ACTIVA */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 backdrop-blur-md border border-gray-200 p-6 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600/10 text-blue-600 rounded-md p-2">
                <IconDumbbell />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Rutina activa</h2>
                <p className="text-sm text-gray-500">
                  Haz clic para verla completa
                </p>
              </div>
            </div>
            {activeRoutine?.routine ? (
              <Link href={`/routine/${activeRoutine.routine.id}`}>
                <div className="p-3 rounded-lg hover:bg-blue-50 transition cursor-pointer">
                  <h3 className="font-bold text-gray-900">
                    {activeRoutine.routine.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeRoutine.routine.description}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="text-sm italic text-gray-500">
                No tienes una rutina activa.
              </p>
            )}
          </motion.article>

          <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 backdrop-blur-md border border-gray-200 p-6 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-600/10 text-green-600 rounded-md p-2">
                <IconSalad />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  Nutrición activa
                </h2>
                <p className="text-sm text-gray-500">
                  Haz clic para ver tu plan
                </p>
              </div>
            </div>
            {activeNutrition?.nutrition ? (
              <Link href={`/nutrition/${activeNutrition.nutrition.id}`}>
                <div className="p-3 rounded-lg hover:bg-green-50 transition cursor-pointer">
                  <h3 className="font-bold text-gray-900">
                    {activeNutrition.nutrition.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeNutrition.nutrition.description}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="text-sm italic text-gray-500">
                No tienes un plan activo.
              </p>
            )}
          </motion.article>
        </section>

        {/* CALENDARIO */}
        <section>
          <h3 className="text-xl font-semibold text-white mb-4">
            Calendario Mensual
          </h3>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {weekDayNames.map((name) => (
                <div
                  key={name}
                  className="font-medium text-sm text-gray-500 pb-2"
                >
                  {name}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="border rounded-lg border-gray-100 bg-gray-50/50"
                ></div>
              ))}
              {daysInMonth.map((day, i) => {
                const { workoutsToday, mealsToday, activeRoutineExercises } = getDayContent(day);
                const today = isToday(day);
                return (
                  <motion.div
                    key={i}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    onMouseEnter={(e) => {
                      if (activeRoutineExercises.length > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPopoverData({
                          visible: true,
                          x: rect.left + window.scrollX,
                          y: rect.bottom + window.scrollY + 5,
                          exercises: activeRoutineExercises,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setPopoverData({ ...popoverData, visible: false });
                    }}
                    className={`p-2 border border-gray-100 rounded-lg h-24 flex flex-col cursor-pointer transition-colors ${
                      today ? "border-blue-500 bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div
                        className={`font-semibold text-gray-800 text-sm ${
                          today ? "text-blue-600" : ""
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      {activeRoutineExercises.length > 0 && (
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          title="Rutina activa"
                        ></div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col overflow-hidden text-xs text-gray-700 mt-1">
                      {/* Este espacio ahora está gestionado por el popover, pero dejamos los indicadores de eventos manuales */}
                      <div className="flex items-end justify-start gap-1.5 mt-1">
                        {workoutsToday.length > 0 && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" title="Entrenamiento manual"></div>
                        )}
                        {mealsToday.length > 0 && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Comida manual"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popover de Ejercicios */}
        <AnimatePresence>
          {popoverData.visible && popoverData.exercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: "absolute",
                top: popoverData.y,
                left: popoverData.x,
                zIndex: 50,
              }}
              className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs text-sm text-gray-800"
            >
              <h4 className="font-bold text-blue-700 mb-2">
                Rutina del día:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {popoverData.exercises.map((exercise, idx) => (
                  <li key={idx}>{exercise}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Resumen semanal
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {resumenSemanal.entrenamientos}
              </p>
              <p className="text-sm text-gray-600">Entrenamientos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {resumenSemanal.comidas}
              </p>
              <p className="text-sm text-gray-600">Comidas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {resumenSemanal.diasActivos}
              </p>
              <p className="text-sm text-gray-600">Días activos</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
