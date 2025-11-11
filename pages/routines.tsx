"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, CheckCircle, PlusCircle, Sparkles, Star } from "lucide-react";
import { predefinedRoutines } from "@/lib/predefined-routines";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    name: "",
    description: "",
    content: "",
  });

  useEffect(() => {
    fetchRoutines();
    fetch("/api/get-active-routine")
      .then((res) => res.json())
      .then((data) => setActiveRoutineId(data?.routineId || null));
  }, []);

  async function fetchRoutines() {
    fetch("/api/routines")
      .then((res) => res.json())
      .then((data) => setRoutines(data));
  }

  async function activateRoutine(routineId: number) {
    await fetch("/api/activate-routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routineId }),
    });
    setActiveRoutineId(routineId);
    alert("Rutina activada en tu calendario ✅");
  }

  async function handleCreateRoutine() {
    if (!newRoutine.name || !newRoutine.content) {
      alert("El nombre y el contenido son obligatorios.");
      return;
    }
    const res = await fetch("/api/routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoutine),
    });

    if (res.ok) {
      alert("✅ Rutina creada correctamente");
      setShowCreateModal(false);
      setNewRoutine({ name: "", description: "", content: "" });
      fetchRoutines(); // Recargar las rutinas
    } else {
      alert("❌ Error al crear la rutina");
    }
  }

  const allRoutines = [...predefinedRoutines, ...routines];
  const activeRoutine = allRoutines.find((r) => r.id === activeRoutineId);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-10 px-6"
      style={{ backgroundImage: "url('images/gym-bg3.png')" }}
    >
      <Sidebar />
      {/* Capa oscura y blur para contraste */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center text-white mb-4"
        >
          Mis Rutinas
        </motion.h1>
        <div className="text-center mb-10">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            <PlusCircle className="w-5 h-5" /> Crear Rutina
          </button>
        </div>

        {/* SECCIÓN DE RUTINA ACTIVA */}
        {activeRoutine && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Star className="text-yellow-400" />
              Tu Rutina Activa
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl p-6 rounded-2xl border-2 border-blue-400"
            >
              <div className="flex items-center gap-3 mb-3">
                <Dumbbell className="w-6 h-6" />
                <h2 className="text-xl font-bold">{activeRoutine.name}</h2>
              </div>

              <p className="mb-4 text-sm opacity-90">
                {activeRoutine.description}
              </p>

              <div className="flex justify-between items-center">
                <a
                  href={`/routine/${activeRoutine.id}`}
                  className="font-medium hover:underline text-sm bg-white/20 px-3 py-1 rounded-md"
                >
                  Ver rutina completa →
                </a>
                <div className="flex items-center gap-2 text-sm font-semibold bg-green-500 px-3 py-1 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span>Activa</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* SECCIÓN DE RUTINAS SUGERIDAS */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Sparkles className="text-yellow-400" />
            Rutinas Sugeridas por FitAI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {predefinedRoutines
              .filter((r) => r.id !== activeRoutineId) // No mostrar si ya es la activa
              .map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/80 backdrop-blur-lg shadow-lg p-6 rounded-2xl border border-white/20 hover:shadow-xl transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Dumbbell className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">{r.name}</h2>
                </div>

                <p className="text-gray-600 mb-4 text-sm">{r.description}</p>

                <div className="flex justify-between items-center">
                  <a
                    href={`/routine/${r.id}`} // Esto necesitará una página dinámica que también pueda cargar rutinas predefinidas
                    className="text-blue-600 font-medium hover:underline text-sm"
                  >
                    Ver rutina →
                  </a>

                  <button
                    onClick={() => activateRoutine(r.id)}
                    className={`px-3 py-1 rounded-lg text-white flex items-center gap-1 text-sm ${
                      activeRoutineId === r.id
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    } transition`}
                  >
                    {activeRoutineId === r.id ? (
                      <>
                        <CheckCircle className="w-4 h-4" /> Activa
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routines
            .filter((r) => r.id !== activeRoutineId) // No mostrar si ya es la activa
            .map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/90 backdrop-blur-lg shadow-xl p-6 rounded-2xl border border-white/20 hover:shadow-2xl transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <Dumbbell className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">{r.name}</h2>
              </div>

              <p className="text-gray-600 mb-4">{r.description}</p>

              <div className="flex justify-between items-center mt-auto">
                <a
                  href={`/routine/${r.id}`}
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Ver rutina →
                </a>

                <button
                  onClick={() => activateRoutine(r.id)}
                  className={`px-3 py-1 rounded-lg text-white flex items-center gap-1 text-sm ${
                    activeRoutineId === r.id
                      ? "bg-green-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  } transition`}
                >
                  {activeRoutineId === r.id ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Activa
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

      {/* Modal para crear rutina */}
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
                Crear Nueva Rutina
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la rutina"
                  value={newRoutine.name}
                  onChange={(e) =>
                    setNewRoutine({ ...newRoutine, name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Descripción breve"
                  value={newRoutine.description}
                  onChange={(e) =>
                    setNewRoutine({
                      ...newRoutine,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Contenido de la rutina (Ej: Press Banca: 4x8, Fondos: 3x12...)"
                  value={newRoutine.content}
                  onChange={(e) =>
                    setNewRoutine({ ...newRoutine, content: e.target.value })
                  }
                  rows={6}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onClick={handleCreateRoutine}
                  className="px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-semibold"
                >
                  Guardar Rutina
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
