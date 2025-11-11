"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle2, Lock } from "lucide-react";

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  progress: number;
  target: number;
  equipped: boolean;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [equippedAchievementId, setEquippedAchievementId] = useState<number | null>(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Achievement[]>("/api/achievements/progress");
      setAchievements(res.data);
      // Encontrar y establecer el logro equipado actual
      const equipped = res.data.find(ach => ach.equipped);
      setEquippedAchievementId(equipped ? equipped.id : null);
    } catch (err) {
      console.error("❌ Error al cargar logros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleEquip = async (achievementId: number) => {
    try {
      await axios.post("/api/achievements/equip", {
        achievementId: achievementId,
      });
      // Volver a cargar los logros para reflejar el cambio
      await fetchAchievements();
    } catch (error) {
      console.error("Error al equipar el logro:", error);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Cargando logros...
      </div>
    );

  const filteredAchievements = achievements.filter((ach) => {
    const matchesCategory =
      selectedCategory === "all" || ach.category === selectedCategory;
    const matchesSearch = ach.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch; 
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': // Común: Verde
        return { border: 'border-green-500', glowShadow: 'shadow-green-500/20' };
      case 'rare': // Raro: Azul
        return { border: 'border-blue-500', glowShadow: 'shadow-blue-500/20' };
      case 'epic': // Épico: Morado
        return { border: 'border-purple-500', glowShadow: 'shadow-purple-500/20' };
      case 'legendary': // Legendario: Amarillo
        return { border: 'border-yellow-400', glowShadow: 'shadow-yellow-400/30' };
      default: // Por defecto: Gris
        return { border: 'border-gray-600', glowShadow: 'shadow-gray-500/10' };
    }
  };
  
  // Esta función es solo para asegurar que Tailwind incluya las clases en el build.
  // No se llama en tiempo de ejecución, pero su presencia es importante.
  const _tailwindSafelist = () => <div className="border-green-500 shadow-green-500/20 border-blue-500 shadow-blue-500/20 border-purple-500 shadow-purple-500/20 border-yellow-400 shadow-yellow-400/30 border-gray-600 shadow-gray-500/10"></div>;


  const categories = [
    { key: "all", name: "Todos" },
    { key: "physical", name: "Físicos" },
    { key: "nutrition", name: "Nutrición" },
    { key: "social", name: "Social" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-10">
      <Sidebar />
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/gym-bg.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-800/60 backdrop-blur-[2px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          Logros
        </h1>
        <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
          Aquí puedes ver todos los logros que has desbloqueado y los que te
          quedan por conseguir. ¡Sigue entrenando para coleccionarlos todos!
        </p>

        {/* Filtros y Búsqueda */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <input
            type="text"
            placeholder="Buscar logro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto bg-white/20 text-white placeholder-gray-300 rounded-lg px-4 py-2 border border-white/30 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
          <div className="flex gap-2 bg-white/10 p-1 rounded-lg border border-white/20">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === cat.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-white/20"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredAchievements.map((ach) => {
            const unlocked = ach.unlocked;
            const { border, glowShadow } = getRarityColor(ach.rarity); // Obtiene las clases de borde y sombra de brillo

            return (
              <motion.div
                key={ach.id}
                whileHover={{ scale: 1.03 }}
                className={`p-5 rounded-2xl border-2 relative overflow-hidden transition-all duration-300 shadow-lg bg-gray-800/60 ${border} ${glowShadow}`}
              >
                {/* Contenedor interno para aplicar grayscale y opacidad solo al contenido */}
                <div className="transition-all duration-300">
                  {/* Icono */}
                  <div className="flex items-center justify-center mb-3">
                    <img
                      src={ach.icon || '/images/defaults/default-achievement-icon.png'} // Añade una imagen de fallback
                      alt={ach.name}
                      className="w-16 h-16 object-contain drop-shadow-md"
                    />
                  </div>
                  {/* Título */}
                  <h2 className="text-lg font-semibold text-white text-center mb-1">
                    {ach.name}
                  </h2>

                  {/* Descripción */}
                  <p className="text-sm text-gray-300 text-center mb-2">
                    {ach.description}
                  </p>

                  {unlocked && (
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => handleEquip(ach.id)}
                        disabled={equippedAchievementId === ach.id}
                        className={`px-4 py-1.5 rounded-lg text-white flex items-center justify-center gap-1.5 text-sm transition-all duration-200 ${
                          equippedAchievementId === ach.id
                            ? "bg-green-600 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                        }`}
                      >
                        {equippedAchievementId === ach.id
                          ? "Equipado"
                          : "Equipar"}
                      </button>
                    </div>
                  )}

                  {/* Barra de Progreso (solo si no está desbloqueado y tiene un objetivo > 1) */}
                  {!unlocked && ach.target > 1 && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 my-3">
                      <motion.div
                        className="bg-blue-500 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(ach.progress / ach.target) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      ></motion.div>
                      <p className="text-xs text-right text-gray-400 mt-1">
                        {ach.progress} / {ach.target}
                      </p>
                    </div>
                  )}

                  {/* Categoría + Estado */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                    <span>{ach.category}</span>
                    {unlocked ? (
                      <span className="flex items-center text-green-400">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Desbloqueado
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500">
                        <Lock className="w-4 h-4 mr-1" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Efecto animado para logros desbloqueados */}
                {unlocked && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 bg-gradient-to-br from-yellow-200/10 to-transparent rounded-2xl"
                  ></motion.div>
                )}
              </motion.div>
            );
          })}

          {filteredAchievements.length === 0 && !loading && (
            <p className="text-center text-gray-400 col-span-full mt-10">
              No se encontraron logros con los filtros actuales.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
