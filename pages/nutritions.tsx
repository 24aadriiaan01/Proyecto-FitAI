"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Salad, CheckCircle2, Sparkles, Star, PlusCircle } from "lucide-react";
import { predefinedNutritions } from "@/lib/predefined-nutritions"; // Importamos los planes predefinidos

export default function NutritionsPage() {
  const [nutritions, setNutritions] = useState<any[]>([]);
  const [activeNutritionId, setActiveNutritionId] = useState<
    string | number | null
  >(null); // Cambiado a string | number
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNutrition, setNewNutrition] = useState({
    name: "",
    description: "",
    content: "",
  });

  useEffect(() => {
    fetchNutritions();
    // Asumiendo que get-active-nutrition devuelve un ID que puede ser string o number
    // y que la comparación con predefinedNutritions.id (number) o nutritions.id (string) se hará con ==
    fetch("/api/get-active-nutrition")
      .then((res) => res.json())
      .then((data) => setActiveNutritionId(data?.nutritionId || null));
  }, []);

  async function fetchNutritions() {
    fetch("/api/nutritions")
      .then((res) => res.json())
      .then((data) => setNutritions(data));
  }

  async function handleCreateNutrition() {
    if (!newNutrition.name || !newNutrition.content) {
      alert("El nombre y el contenido son obligatorios.");
      return;
    }
    const res = await fetch("/api/nutritions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNutrition),
    });

    if (res.ok) {
      alert("✅ Plan de nutrición creado correctamente");
      setShowCreateModal(false);
      setNewNutrition({ name: "", description: "", content: "" });
      fetchNutritions(); // Recargar los planes
    } else {
      alert("❌ Error al crear el plan de nutrición");
    }
  }

  async function activateNutrition(nutritionId: number | string) {
    await fetch("/api/activate-nutrition", {
      // nutritionId puede ser number o string aquí
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nutritionId }),
    });
    setActiveNutritionId(nutritionId);
    alert("Plan de nutrición activado en tu calendario ✅");
  }

  const allNutritions = [...predefinedNutritions, ...nutritions];
  const activeNutrition = allNutritions.find((n) => n.id == activeNutritionId); // Usamos == para comparar string/number

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-12 px-6"
      // Corregido el doble slash en la ruta de la imagen
      style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
    >
      <Sidebar />
      {/* Overlay para contraste */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-white text-center mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Mis Planes de Nutrición
        </motion.h1>
        <div className="text-center mb-10">
          <p className="text-gray-200 mb-4 max-w-2xl mx-auto">
            Aquí encontrarás tus planes de nutrición. Activa uno para integrarlo
            con tu calendario o crea uno nuevo.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            <PlusCircle className="w-5 h-5" /> Crear Plan
          </button>
        </div>

        {/* SECCIÓN DE PLAN ACTIVO */}
        {activeNutrition && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Star className="text-yellow-400" />
              Tu Plan de Nutrición Activo
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl p-6 rounded-2xl border-2 border-green-400"
            >
              <div className="flex items-center gap-3 mb-3">
                <Salad className="w-6 h-6" />
                <h2 className="text-xl font-bold">{activeNutrition.name}</h2>
              </div>

              <p className="mb-4 text-sm opacity-90">
                {activeNutrition.description}
              </p>

              <div className="flex justify-between items-center">
                <a
                  href={`/nutrition/${activeNutrition.id}`}
                  className="font-medium hover:underline text-sm bg-white/20 px-3 py-1 rounded-md"
                >
                  Ver plan completo →
                </a>
                <div className="flex items-center gap-2 text-sm font-semibold bg-green-500 px-3 py-1 rounded-md">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activo</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* SECCIÓN DE PLANES SUGERIDOS */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Sparkles className="text-yellow-400" />
            Planes de Nutrición Sugeridos por FitAI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {predefinedNutritions
              .filter((n) => n.id != activeNutritionId) // No mostrar si ya es el activo
              .map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/85 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Salad className="text-green-600 w-6 h-6" />
                    <h2 className="text-xl font-semibold text-gray-800">{n.name}</h2>
                  </div>

                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    {n.description || "Plan de nutrición personalizado."}
                  </p>

                  <div className="flex justify-between items-center">
                    <a
                      href={`/nutrition/${n.id}`}
                      className="text-blue-600 font-medium hover:underline text-sm"
                    >
                      Ver plan →
                    </a>

                    <button
                      onClick={() => activateNutrition(n.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                        activeNutritionId == n.id // Usamos == para comparar string/number
                          ? "bg-green-600 text-white shadow-inner"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {activeNutritionId == n.id ? ( // Usamos == para comparar string/number
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Activo
                        </>
                      ) : (
                        "Activar"
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* SECCIÓN DE TUS PLANES */}
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <Salad className="text-green-400" />
          Tus Planes de Nutrición
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nutritions
            .filter((n) => n.id != activeNutritionId) // No mostrar si ya es el activo
            .map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/85 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <Salad className="text-green-600 w-6 h-6" />
                <h2 className="text-xl font-semibold text-gray-800">{n.name}</h2>
              </div>

              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                {n.description || "Plan de nutrición personalizado."}
              </p>

              <div className="flex justify-between items-center">
                <a
                  href={`/nutrition/${n.id}`}
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Ver plan →
                </a>

                <button
                  onClick={() => activateNutrition(n.id)} // nutritionId puede ser string aquí
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    activeNutritionId == n.id // Usamos == para comparar string/number
                      ? "bg-green-600 text-white shadow-inner"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {activeNutritionId == n.id ? ( // Usamos == para comparar string/number
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Activo
                    </>
                  ) : (
                    "Activar"
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sin planes */}
        {allNutritions.filter(n => n.id != activeNutritionId).length === 0 && ( // Si no hay planes para mostrar
          <motion.p
            className="text-center text-gray-300 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No tienes planes de nutrición todavía. 
          </motion.p>
        )}

        {/* Modal para crear plan de nutrición */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-lg text-gray-800 relative"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Crear Nuevo Plan de Nutrición
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre del plan"
                    value={newNutrition.name}
                    onChange={(e) =>
                      setNewNutrition({ ...newNutrition, name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Descripción breve"
                    value={newNutrition.description}
                    onChange={(e) =>
                      setNewNutrition({
                        ...newNutrition,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    placeholder="Contenido del plan (Ej: Desayuno: Avena, Comida: Pollo con arroz...)"
                    value={newNutrition.content}
                    onChange={(e) =>
                      setNewNutrition({ ...newNutrition, content: e.target.value })
                    }
                    rows={6}
                    className="w-full p-3 rounded-xl bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateNutrition}
                    className="px-5 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition font-semibold"
                  >
                    Guardar Plan
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
