"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import { Instagram, Twitter, Youtube, MessageSquare } from "lucide-react";

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  level?: string;
  bio?: string;
  image?: string;
  socials?: {
    instagram?: string;
    x?: string;
    youtube?: string;
  };
}

interface EquippedAchievement {
  icon: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile: UserProfile; // Cambiado a no opcional para consistencia
  equippedAchievement: EquippedAchievement | null;
}

export default function FriendProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [friend, setFriend] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        // ✅ Tipado correcto para Axios (ya no da error "unknown")
        const res = await axios.get<User>(`/api/friends/profile/${id}`);
        setFriend(res.data);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-gray-400 text-lg">Cargando perfil...</p>
      </div>
    );

  if (!friend)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-red-400 text-lg">Perfil no encontrado</p>
      </div>
    );

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo con imagen estilo FitAI */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-800/60 backdrop-blur-[2px]"></div>

      {/* Tarjeta del perfil */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-lg text-white">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full p-2 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* -- SECCIÓN SUPERIOR: AVATAR, NOMBRE Y ACCIONES -- */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          <div className="flex-shrink-0">
            <img
              src={friend.profile?.image || "/images/defaults/avatar1.png"}
              alt="Avatar"
              className="w-28 h-28 rounded-full shadow-lg border-2 border-white/40 object-cover"
            />
          </div>
          {/* Logro Equipado */}
          {friend.equippedAchievement?.icon && (
            <div className="absolute top-20 left-24 group">
              <img
                src={friend.equippedAchievement.icon}
                alt={friend.equippedAchievement.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
              />
              <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-1/2 -translate-x-1/2">
                {friend.equippedAchievement.name}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center sm:items-start w-full">
            <h1 className="text-3xl font-bold">{friend.name}</h1>
            <p className="text-gray-400 text-sm mb-4">{friend.email}</p>
            <button
              onClick={() => router.push(`/friends/chat/${friend.id}`)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" /> Enviar mensaje
            </button>
          </div>
        </div>

        {/* -- BARRA DE ESTADÍSTICAS -- */}
        <div className="grid grid-cols-3 gap-4 text-center bg-white/10 p-4 rounded-xl mb-6">
          <div>
            <p className="text-2xl font-bold">{friend.profile?.age || "-"}</p>
            <p className="text-xs text-gray-300 uppercase">Edad</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{friend.profile?.weight || "-"}<span className="text-lg">kg</span></p>
            <p className="text-xs text-gray-300 uppercase">Peso</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{friend.profile?.height || "-"}<span className="text-lg">cm</span></p>
            <p className="text-xs text-gray-300 uppercase">Altura</p>
          </div>
        </div>

        {/* -- BIO, OBJETIVO Y NIVEL -- */}
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-200 mb-1">Bio</h3>
            <p className="text-gray-300 italic text-sm bg-white/5 p-3 rounded-lg">{friend.profile?.bio || "Este usuario no ha añadido una bio."}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-200 mb-1">Objetivo</h3>
              <p className="text-gray-300 text-sm bg-white/5 p-3 rounded-lg">{friend.profile?.goal || "No especificado"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-1">Nivel</h3>
              <p className="text-gray-300 text-sm bg-white/5 p-3 rounded-lg">{friend.profile?.level || "No especificado"}</p>
            </div>
          </div>
        </div>

        {/* -- REDES SOCIALES -- */}
        <div className="flex justify-center items-center gap-4">
          {friend.profile?.socials?.instagram && (
            <a href={`https://instagram.com/${friend.profile.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition"><Instagram className="w-6 h-6" /></a>
          )}
          {friend.profile?.socials?.x && (
            <a href={`https://x.com/${friend.profile.socials.x}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition"><Twitter className="w-6 h-6" /></a>
          )}
          {friend.profile?.socials?.youtube && (
            <a href={`https://youtube.com/channel/${friend.profile.socials.youtube}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition"><Youtube className="w-6 h-6" /></a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
