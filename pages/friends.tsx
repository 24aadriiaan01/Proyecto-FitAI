"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Nueva interfaz para el perfil del usuario (copiada de profile.tsx o friends/[id].tsx)
interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  level?: string;
  bio?: string;
  image?: string; // Propiedad de imagen que necesitamos
  socials?: {
    instagram?: string;
    x?: string;
    youtube?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  profile?: UserProfile; // Añadimos el perfil, puede ser opcional si no siempre se carga
}

interface Friendship {
  id: number;
  requester: User;
  receiver: User;
  status: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pending, setPending] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [allFriendships, setAllFriendships] = useState<Friendship[]>([]);

  // 🧩 Cargar amistades
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get<Friendship[]>("/api/friends/requests");
        const data = res.data;
        setAllFriendships(data);
        setFriends(data.filter((f) => f.status === "accepted"));
        setPending(
          data.filter(
            (f) => f.status === "pending" && f.receiver.email === session?.user?.email
          )
        );
      } catch (err) {
        console.error("Error cargando amigos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [session]);

  // 🔍 Buscar usuarios
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await axios.get<User[]>(`/api/friends/search?q=${searchTerm}`);
      setResults(res.data);
    } catch (err) {
      console.error("Error buscando usuarios:", err);
    } finally {
      setSearching(false);
    }
  };

  // 📨 Enviar solicitud
  const sendRequest = async (receiverId: string) => {
    try {
      await axios.post("/api/friends/send-request", { receiverId });
      const res = await axios.get<Friendship[]>("/api/friends/requests");
      setAllFriendships(res.data);
      alert("Solicitud enviada ✅");
    } catch (err) {
      console.error(err);
      alert("Error al enviar solicitud");
    }
  };

  // ✅ Aceptar o ❌ Rechazar solicitud
  const handleRequest = async (id: number, action: "accept" | "reject") => {
    try {
      await axios.post("/api/friends/respond", { friendshipId: id, action });
      setPending((prev) => prev.filter((req) => req.id !== id));
      if (action === "accept") {
        const updated = pending.find((req) => req.id === id);
        if (updated) setFriends((prev) => [...prev, { ...updated, status: "accepted" }]);
      }
    } catch (err) {
      console.error("Error actualizando solicitud:", err);
    }
  };

  const getFriendshipStatus = (userId: string) => {
    const friendship = allFriendships.find(
      (f) => f.requester.id === userId || f.receiver.id === userId
    );
    if (!friendship) return "none";
    if (friendship.status === "accepted") return "friends";
    if (friendship.status === "pending") {
      return friendship.requester.email === session?.user?.email ? "sent" : "received";
    }
    return "none";
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <Sidebar />
      {/* Fondo con gym-bg2 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-800/60 backdrop-blur-[2px]"></div>

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-8 py-10 w-full max-w-2xl"
      >
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Amigos</h1>
        <p className="text-center text-gray-300 mb-8">
          Administra tus contactos y solicitudes
        </p>

        {/* Botones principales */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowSearchDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors px-5 py-2 rounded-xl font-semibold shadow-md"
          >
            Buscar usuarios
          </button>
          <button
            onClick={() => setShowPendingDialog(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white transition-colors px-5 py-2 rounded-xl font-semibold shadow-md"
          >
            Solicitudes pendientes
          </button>
        </div>

        {/* Lista de amigos */}
        {loading ? (
          <p className="text-center text-gray-400">Cargando...</p>
        ) : friends.length === 0 ? (
          <p className="text-center text-gray-400">
            Aún no tienes amigos añadidos
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {friends.map((f) => {
              const friend =
                f.requester.email === session?.user?.email ? f.receiver : f.requester;
              return (
                <motion.div
                  key={f.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center bg-white/10 border border-white/10 p-3 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.profile?.image || "/images/defaults/avatar1.png"} // Usar la imagen del perfil o un avatar por defecto
                      alt={friend.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {friend.name}
                      </p>
                      <p className="text-gray-300 text-sm">{friend.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/friends/${friend.id}`)}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    Ver perfil
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* 🔍 Modal de búsqueda */}
      <AnimatePresence>
        {showSearchDialog && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md text-white relative"
            >
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Buscar usuarios
              </h2>

              <input
                type="text"
                placeholder="Nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={handleSearch}
                disabled={searching}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-3 rounded-xl font-semibold mb-4"
              >
                {searching ? "Buscando..." : "Buscar"}
              </button>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {results.length === 0 && !searching ? (
                  <p className="text-gray-400 text-center">Sin resultados</p>
                ) : (
                  results.map((user) => {
                    const status = getFriendshipStatus(user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex justify-between items-center bg-white/20 border border-white/10 p-3 rounded-xl"
                      > 
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profile?.image || "/images/defaults/avatar1.png"} // Usar la imagen del perfil o un avatar por defecto
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                          />
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-300">{user.email}</p>
                          </div>
                        </div>
                        <div>
                          {status === "friends" ? (
                          <button
                            disabled
                            className="bg-green-600 px-3 py-1.5 rounded-lg text-sm opacity-70"
                          >
                            Amigos
                          </button>
                        ) : status === "sent" ? (
                          <button
                            disabled
                            className="bg-yellow-600 px-3 py-1.5 rounded-lg text-sm opacity-70"
                          >
                            Solicitado
                          </button>
                        ) : (
                          <button
                            onClick={() => sendRequest(user.id)}
                            className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm transition"
                          >
                            Agregar
                          </button>
                        )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => setShowSearchDialog(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white transition"
              >
                ✖
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📨 Modal pendientes */}
      <AnimatePresence>
        {showPendingDialog && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md text-white relative"
            >
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Solicitudes pendientes
              </h2>

              {pending.length === 0 ? (
                <p className="text-center text-gray-400">
                  No tienes solicitudes pendientes
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {pending.map((req) => (
                    <div
                      key={req.id}
                      className="flex justify-between items-center bg-white/20 border border-white/10 p-3 rounded-xl"
                    > 
                      <div className="flex items-center gap-3">
                        <img
                          src={req.requester.profile?.image || "/images/defaults/avatar1.png"} // Usar la imagen del perfil o un avatar por defecto
                          alt={req.requester.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                        />
                        <div>
                          <p className="font-semibold">{req.requester.name}</p>
                          <p className="text-sm text-gray-300">
                            {req.requester.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequest(req.id, "accept")}
                          className="bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg text-sm transition"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleRequest(req.id, "reject")}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-sm transition"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowPendingDialog(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white transition"
              >
                ✖
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
