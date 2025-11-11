"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Trash2 } from "lucide-react";

type UserMemory = {
  id: number;
  userId: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export default function MemoryPage() {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [newMemory, setNewMemory] = useState({ key: "", value: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    try {
      setLoading(true);
      const res = await fetch("/api/memory");
      if (!res.ok) throw new Error("Error al cargar recuerdos");
      const data: UserMemory[] = await res.json();
      setMemories(data);
    } catch (error) {
      console.error("❌ Error al obtener memorias:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addMemory() {
    if (!newMemory.key || !newMemory.value) return;
    try {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemory),
      });
      setNewMemory({ key: "", value: "" });
      fetchMemories();
    } catch (error) {
      console.error("❌ Error al añadir memoria:", error);
    }
  }

  async function updateMemory(id: number, value: string) {
    try {
      await fetch("/api/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, value }),
      });
      fetchMemories();
    } catch (error) {
      console.error("❌ Error al actualizar memoria:", error);
    }
  }

  async function deleteMemory(id: number) {
    try {
      await fetch(`/api/memory?id=${id}`, { method: "DELETE" });
      fetchMemories();
    } catch (error) {
      console.error("❌ Error al eliminar memoria:", error);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Cargando memoria de FitAI...</p>
      </div>
    );

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center py-12 px-4"
      style={{ backgroundImage: "url('/images/gym-bg2.png')" }}
    >
      {/* Capa de oscurecimiento para mejorar contraste */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Contenedor principal */}
      <motion.div
        className="relative z-10 w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Título */}
        <motion.h1
          className="text-4xl font-bold text-gray-900 text-center mb-3"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🧠 Memoria de FitAI
        </motion.h1>
        <p className="text-center text-gray-600 mb-8">
          Gestiona lo que FitAI recuerda sobre ti para mejorar tus rutinas y nutrición.
        </p>

        {/* Guía de uso */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/70 p-6 rounded-xl border border-blue-200 mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Cómo aprovechar la memoria
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>
              <strong>Actualiza tu perfil:</strong> FitAI adapta tus planes según tu información.
            </li>
            <li>
              <strong>Añade recuerdos:</strong> Registra lesiones, preferencias o metas clave.
            </li>
            <li>
              <strong>Elimina lo que ya no sirva:</strong> Mantén tus datos limpios y relevantes.
            </li>
          </ul>
        </div>

        {/* Añadir nuevo recuerdo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md border border-gray-200 mb-8"
        >
          <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" /> Añadir nuevo recuerdo
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Dato a recordar (Ej: Lesión, Preferencia)"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={newMemory.key}
              onChange={(e) => setNewMemory({ ...newMemory, key: e.target.value })}
            />
            <input
              type="text"
              placeholder="Información específica (Ej: No me gusta el pescado)"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={newMemory.value}
              onChange={(e) => setNewMemory({ ...newMemory, value: e.target.value })}
            />
            <button
              onClick={addMemory}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 font-medium"
            >
              <PlusCircle className="w-5 h-5" /> Guardar Recuerdo
            </button>
          </div>
        </motion.div>

        {/* Lista de recuerdos */}
        <motion.div
          className="bg-white/85 backdrop-blur-md rounded-xl shadow-md border border-gray-200 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recuerdos guardados
          </h2>

          {memories.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No hay recuerdos almacenados todavía.
            </p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className="bg-gray-50/70 border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition"
                >
                  <div className="flex-1 mr-3">
                    <p className="font-semibold text-gray-800">{m.key}</p>
                    <input
                      className="border rounded-lg px-2 py-1 w-full mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      defaultValue={m.value}
                      onBlur={(e) => updateMemory(m.id, e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => deleteMemory(m.id)}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
