"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { predefinedRoutines } from "@/lib/predefined-routines";

export default function RoutineDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [routine, setRoutine] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado para controlar la carga
  const [error, setError] = useState<string | null>(null); // Nuevo estado para errores

  useEffect(() => {
    if (!id) {
      // Si el ID no está disponible aún, seguimos cargando
      setIsLoading(true);
      return;
    }

    setIsLoading(true); // Iniciar carga
    setError(null); // Limpiar errores previos

    // El ID puede ser un número (predefinidas) o un string (de usuario)
    const isPredefined = typeof id === 'string' && id.startsWith('-');

    // Si el ID es negativo (como string), es una rutina predefinida
    if (isPredefined) {
      const routineIdNum = Number(id);
      const found = predefinedRoutines.find((r) => r.id === routineIdNum);
      if (found) {
        setRoutine(found);
      } else {
        setError(`Rutina predefinida con ID ${id} no encontrada.`);
      }
      setIsLoading(false);
    } else {
      // Si no, es una rutina del usuario y la buscamos en la API
      fetch(`/api/routines`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error al cargar rutinas: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const found = data.find((r: any) => r.id == id);
          if (found) {
            setRoutine(found);
          } else {
            setError(`Rutina de usuario con ID ${id} no encontrada.`);
          }
        })
        .catch((err) => {
          console.error("Error al obtener la rutina:", err);
          setError(err.message || "Error al cargar la rutina.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
        <p className="text-lg animate-pulse">Cargando rutina...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
        <p className="text-lg text-red-400 mb-4">{error}</p>
        <button
          onClick={() => router.push("/routines")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Volver a mis rutinas
        </button>
      </div>
    );

  if (!routine) {
    // Esto debería ser cubierto por `error` ahora, pero como fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
        <p className="text-lg mb-4">Rutina no encontrada.</p>
        <button
          onClick={() => router.push("/routines")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Volver a mis rutinas
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-10 px-6"
      style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/routines")}
          className="flex items-center gap-2 text-white mb-8 hover:text-blue-300 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Volver a mis rutinas
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Dumbbell className="text-blue-600 w-7 h-7" />
            <h1 className="text-3xl font-bold text-gray-800">{routine.name}</h1>
          </div>

          <p className="text-gray-600 mb-8">{routine.description}</p>

          {/* Contenido renderizado en Markdown */}
          <div className="prose prose-blue max-w-none text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {routine.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
