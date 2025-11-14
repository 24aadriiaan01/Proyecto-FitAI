"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import io from "socket.io-client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Cargamos el selector de emojis sin SSR
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface DirectMessage {
  id: number;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  image?: string;
}

// Nueva interfaz para el perfil del usuario (similar a la de profile.tsx)
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

interface Friend {
  id: string;
  name: string;
  email: string;
  profile?: UserProfile; // ✅ Añadimos el perfil del amigo
}

export default function ChatPage() {
  const router = useRouter();
  const { data: session } = useSession(); // 2. Obtener la sesión actual
  const { id } = router.query;
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔹 Cargar amigo + mensajes previos
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [friendRes, messagesRes] = await Promise.all([
          axios.get<Friend>(`/api/friends/profile/${id}`),
          axios.get<DirectMessage[]>(`/api/friends/chat/${id}`),
        ]);
        setFriend(friendRes.data);
        setMessages(messagesRes.data);
      } catch (err) {
        console.error("Error cargando chat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 🔸 Conectar Socket.IO
  useEffect(() => {
    // 3. Asegurarse de que tenemos el ID del amigo y el ID del usuario actual
    if (!id || !session?.user?.id) return;

    // 🔸 Inicializamos el socket una sola vez
    fetch("/api/socket_io");

    const newSocket = io({
      path: "/api/socket_io",
      transports: ["websocket"], 
    });

    // 4. Crear el ID de la sala de la misma forma que en el backend
    const chatRoomId = [session.user.id, id].sort().join('-');
    
    // 5. Unirse a la sala correcta
    newSocket.emit("join_room", chatRoomId);

    newSocket.on("receive_message", (msg: DirectMessage) => { // Mantener el tipo DirectMessage para seguridad
      setMessages((prev) => [...prev, msg]);
    });
    setSocket(newSocket);

    // 🧹 La función de limpieza se ejecuta solo al desmontar el componente
    return () => {
      newSocket.disconnect();
    };
  }, [id, session]); // 6. Añadir session como dependencia

  // 🔸 Scroll automático al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📩 Enviar nuevo mensaje (texto o imagen)
  const sendMessage = async () => {
    if ((!newMessage.trim() && !image) || !id || !socket) return;

    const formData = new FormData();
    formData.append("content", newMessage);
    if (image) formData.append("image", image);

    try {
      const res = await axios.post<DirectMessage>(
        `/api/friends/chat/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      // No es necesario volver a emitir el mensaje desde el cliente.
      // El backend ya se encarga de emitirlo a la sala correcta.
      // La línea `socket.emit("send_message", ...)` puede ser eliminada.
      // El evento "receive_message" que escucha el cliente recibirá el mensaje del backend.

      setNewMessage("");
      setImage(null);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        Cargando chat...
      </div>
    );

  if (!friend)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Usuario no encontrado
      </div>
    );

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Fondo estilo FitAI */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-[2px]"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* HEADER */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/10 backdrop-blur-md border-b border-white/10 text-white">
          <div className="flex items-center gap-3"> {/* ✅ Nuevo div para agrupar imagen y nombre */}
            {friend?.profile?.image && (
              <img
                src={friend.profile.image}
                alt={friend.name}
                className="w-8 h-8 rounded-full object-cover border border-white/30"
              />
            )}
            <h1 className="text-lg sm:text-xl font-semibold tracking-wide">
              {friend.name}
            </h1>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition"
          >
            ← Volver
          </button>
        </header>

        {/* MENSAJES */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                msg.senderId === friend.id ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`p-3 sm:p-4 rounded-2xl max-w-[80%] sm:max-w-lg shadow-md text-wrap ${
                  msg.senderId === friend.id
                    ? "bg-white/90 text-gray-900 rounded-bl-none"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Imagen enviada"
                    className="rounded-lg mb-2 max-w-full"
                  />
                )}
                <p className="text-sm sm:text-base">{msg.content}</p>
                <span className="text-xs opacity-60 block text-right mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* INPUT */}
        <footer className="p-3 sm:p-4 bg-white/10 backdrop-blur-md border-t border-white/10 flex gap-2 items-center">
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
          >
            😀
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {/* Botón para adjuntar imagen (reemplaza el input por defecto) */}
          <label
            htmlFor="file-input"
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 cursor-pointer transition"
          >
            📎
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />

          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={image ? "Añade un comentario..." : "Escribe tu mensaje..."}
              className="w-full border border-white/20 bg-white/20 text-white placeholder-gray-300 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
            />
            {image && <span className="absolute left-4 -top-5 text-xs text-blue-300 bg-gray-800/50 px-2 py-0.5 rounded-full">{image.name}</span>}
          </div>

          <button
            onClick={sendMessage}
            className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-2xl transition shadow-md text-sm sm:text-base"
          >
            Enviar
          </button>
        </footer>
      </div>
    </div>
  );
}
