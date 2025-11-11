"use client";
import React, { useEffect, useState, ChangeEvent, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router"; // Corrected import for Pages Router
import { motion } from "framer-motion"; // Asegúrate de que motion esté importado
import { Save, LogOut, Upload, Instagram, Twitter, Youtube } from "lucide-react";
import axios from "axios";

interface SocialLinks {
  instagram: string;
  x: string;
  youtube: string;
}

interface UserProfile {
  age: string;
  weight: string;
  height: string;
  goal: string;
  level: string;
  bio: string;
  socials: SocialLinks;
  image: string | null;
}

interface ProfileData {
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  level?: string;
  bio?: string;
  socials?: SocialLinks;
  image?: string;
}

interface EquippedAchievementData {
  icon: string | null;
  name: string | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const navigation = useRouter();

  const [form, setForm] = useState<UserProfile>({
    age: "",
    weight: "",
    height: "",
    goal: "",
    level: "",
    bio: "",
    socials: { instagram: "", x: "", youtube: "" },
    image: null,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [equippedAchievement, setEquippedAchievement] = useState<{ icon: string | null; name: string | null; }>({ icon: null, name: null });

  // Wrapped fetchProfile in useCallback to make it stable
  const fetchProfile = useCallback(async () => {
    console.log("Fetching profile...");
    try {
      const res = await axios.get<ProfileData>("/api/profile");
      const data = res.data;
      if (data) {
        setForm({
          age: data.age?.toString() ?? "",
          weight: data.weight?.toString() ?? "",
          height: data.height?.toString() ?? "",
          goal: data.goal ?? "",
          level: data.level ?? "",
          bio: data.bio ?? "",
          socials: data.socials ?? { instagram: "", x: "", youtube: "" },
          image: data.image ?? null,
        });
        setPreview(data.image ?? null);
      }

      // Cargar el logro equipado
      const equippedRes = await axios.get<EquippedAchievementData>("/api/achievements/equipped");
      if (equippedRes.data) {
        setEquippedAchievement({
          icon: equippedRes.data.icon,
          name: equippedRes.data.name,
        });
      } else {
        setEquippedAchievement({ icon: null, name: null });
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
  }, [session?.user?.email]); // Dependency on session.user.email to re-fetch if user changes

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchProfile();
  }, [status, router, fetchProfile]); // Added fetchProfile to dependencies

  async function saveProfile() {
    const formData = new FormData();
    if (selectedImage) formData.append("image", selectedImage);
    formData.append("age", form.age);
    formData.append("weight", form.weight);
    formData.append("height", form.height);
    formData.append("goal", form.goal);
    formData.append("level", form.level);
    formData.append("bio", form.bio);
    formData.append("socials", JSON.stringify(form.socials));

    await axios.post("/api/profile", formData);
    alert("✅ Perfil guardado correctamente");
    fetchProfile();
  }

  const handleSocialChange = (key: keyof SocialLinks, value: string) => {
    setForm((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: value },
    }));
  };

  if (status === "loading")
    return <p className="p-10 text-center text-white">Cargando perfil...</p>;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/gym-bg2.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-800/60 backdrop-blur-[2px]"></div>

      {/* Contenedor principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-8 py-10 w-full max-w-md text-white"
      >
        {/* Cabecera */}
        <button
          onClick={() => navigation.push('/profile-view')}
          className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full p-2 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={preview || "/images/defaults/avatar1.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full shadow-lg mb-3 border-2 border-white/40 object-cover transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-400"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-1 right-1 bg-blue-600/80 hover:bg-blue-700 text-white p-2 rounded-full shadow-md cursor-pointer transition"
            >
              <Upload className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImage(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <h1 className="text-3xl font-bold mt-4 mb-1">
            {session?.user?.name || "Mi Perfil"}
          </h1>
          <p className="text-gray-300 text-sm">
            {session?.user?.email}
          </p>

          {equippedAchievement.icon && (
            <div className="mt-4 group relative">
              <img
                src={equippedAchievement.icon}
                alt={equippedAchievement.name ?? ''}
                className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 mx-auto shadow-lg"
              />
              <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-1/2 -translate-x-1/2">
                {equippedAchievement.name}
              </div>
            </div>
          )}
        </div> {/* Fin de la cabecera */}

        {/* Campos de perfil */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-200">Edad</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ej: 30"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-200">Peso (kg)</label>
          <input
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ej: 75.5"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-200">Altura (cm)</label>
          <input
            type="number"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ej: 170"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-200">Objetivo</label>
          <input
            type="text"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ej: Ganar masa muscular"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-200">Nivel</label>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="w-full p-3 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>Selecciona tu nivel</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-200">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={2}
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Escribe algo sobre ti..."
          />
        </div>

        {/* Redes sociales */}
        <div className="mb-6 space-y-3"> {/* Increased bottom margin for spacing */}
          <label className="block mb-1 text-sm font-medium text-gray-200">Redes Sociales</label>
          <div className="relative flex items-center">
            <Instagram className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Usuario de Instagram"
              value={form.socials.instagram}
              onChange={(e) => handleSocialChange("instagram", e.target.value)}
              className="w-full pl-10 p-3 rounded-xl bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="relative flex items-center">
            <Twitter className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Usuario de X (Twitter)"
              value={form.socials.x}
              onChange={(e) => handleSocialChange("x", e.target.value)}
              className="w-full pl-10 p-3 rounded-xl bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="relative flex items-center">
            <Youtube className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Canal de YouTube"
              value={form.socials.youtube}
              onChange={(e) => handleSocialChange("youtube", e.target.value)}
              className="w-full pl-10 p-3 rounded-xl bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Botones */}
        <button
          onClick={saveProfile}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" /> Guardar cambios
        </button>
      </motion.div>
    </div>
  );
}
