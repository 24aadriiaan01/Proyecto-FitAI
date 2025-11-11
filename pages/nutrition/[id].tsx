"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ArrowLeft, Salad } from "lucide-react";
import { predefinedNutritions } from "@/lib/predefined-nutritions"; // Importamos los planes predefinidos

export default function NutritionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [nutrition, setNutrition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado para controlar la carga
  const [error, setError] = useState<string | null>(null); // Nuevo estado para errores

  useEffect(() => {
    if (!id) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    // El ID puede ser un número (predefinidas) o un string (de usuario)
    const isPredefined = typeof id === 'string' && id.startsWith('-');

    if (isPredefined) {
      const nutritionIdNum = Number(id);
      const found = predefinedNutritions.find((n) => n.id === nutritionIdNum);
      if (found) {
        setNutrition(found);
      } else {
        setError(`Plan de nutrición predefinido con ID ${id} no encontrado.`);
      }
      setIsLoading(false);
    } else {
      // Si no, es un plan del usuario y lo buscamos en la API
      fetch(`/api/nutritions`) // No pasamos el ID en la URL, filtramos en el cliente
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error al cargar planes de nutrición: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const found = data.find((n: any) => n.id == id); // Usamos == para comparar string/number
          if (found) {
            setNutrition(found);
          } else {
            setError(`Plan de nutrición de usuario con ID ${id} no encontrado.`);
          }
        })
        .catch((err) => {
          console.error("Error al obtener el plan de nutrición:", err);
          setError(err.message || "Error al cargar el plan de nutrición.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
        <p className="text-lg animate-pulse">Cargando plan de nutrición...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
        <p className="text-lg text-red-400 mb-4">{error}</p>
        <button
          onClick={() => router.push("/nutritions")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Volver a mis planes
        </button>
      </div>
    );

  if (!nutrition) {
    // Esto debería ser cubierto por `error` ahora, pero como fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
        <p className="text-lg mb-4">Plan de nutrición no encontrado.</p>
        <button
          onClick={() => router.push("/nutritions")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Volver a mis planes
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-10 px-6"
      style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
    >
      {/* Capa oscura para contraste */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Botón de volver */}
        <button
          onClick={() => router.push("/nutritions")}
          className="flex items-center gap-2 text-white mb-8 hover:text-blue-300 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Volver a mis planes
        </button>

        {/* Tarjeta principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Salad className="text-green-600 w-7 h-7" />
            <h1 className="text-3xl font-bold text-gray-800">{nutrition.name}</h1>
          </div>

          <p className="text-gray-600 mb-8">{nutrition.description}</p>

          {/* Contenido renderizado en Markdown */}
          <div className="prose prose-blue max-w-none text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {nutrition.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
