import { useSession, signOut } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Cargar mensajes
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        const msgs = Array.isArray(data)
          ? data
          : Array.isArray(data.messages)
          ? data.messages
          : [];
        setMessages(msgs);
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
        setMessages([]);
      }
    }

    if (status === "authenticated") loadMessages();
  }, [status]);

  // Autoscroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMessage]);

  if (status === "loading")
    return <p className="text-center mt-20 text-white">Cargando...</p>;
  if (!session) return null;

  // Enviar mensaje
  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTypingMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply = data.reply || "Error al recibir respuesta.";

      let index = 0;
      const interval = setInterval(() => {
        if (index < reply.length) {
          setTypingMessage((prev) => prev + reply[index]);
          index++;
        } else {
          clearInterval(interval);
          setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
          setTypingMessage("");
          setLoading(false);
        }
      }, 15);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error al conectar con la IA." },
      ]);
      setLoading(false);
    }
  }

  // Limpiar mensajes
  function clearChat() {
    const confirmClear = confirm("¿Seguro que quieres borrar todos los mensajes?");
    if (confirmClear) {
      setMessages([]);
      fetch("/api/messages", { method: "DELETE" }).catch(() => {});
    }
  }

  // Guardar rutinas
  async function handleSaveRoutine(content: string) {
    const name = prompt("Ponle un nombre a tu rutina:");
    if (!name) return;
    const description = prompt("Descripción breve de la rutina:");
    const res = await fetch("/api/routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, content }),
    });
    alert(res.ok ? "✅ Rutina guardada correctamente" : "❌ Error al guardar la rutina");
  }

  // Guardar nutrición
  async function handleSaveNutrition(content: string) {
    const name = prompt("Ponle un nombre a tu plan de nutrición:");
    if (!name) return;
    const description = prompt("Descripción breve del plan de nutrición:");
    const res = await fetch("/api/nutritions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, content }),
    });
    alert(res.ok ? "✅ Plan de nutrición guardado correctamente" : "❌ Error al guardar el plan");
  }

  function isRoutineMessage(content: string) {
    const keywords = ["día", "ejercicio", "repeticiones", "series", "minutos", "calentamiento", "enfriamiento"];
    return keywords.some((kw) => content.toLowerCase().includes(kw));
  }

  function isNutritionMessage(content: string) {
    const keywords = [
      "desayuno", "almuerzo", "cena", "snack",
      "gramos", "proteínas", "calorías",
      "plan de comida", "alimentación", "nutrición", "dieta",
    ];
    return keywords.some((kw) => content.toLowerCase().includes(kw));
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <Sidebar />
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/gym-bg.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-800/40 backdrop-blur-[2px]"></div>
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border-b border-white/10">
          <h1 className="text-xl font-bold text-white mx-auto">FitAI Chat</h1>
          <button
            onClick={() => router.push('/memoria')}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-full bg-purple-600 hover:bg-purple-700"
            title="Gestionar memoria de FitAI"
          >
            <Brain className="w-6 h-6" style={{ strokeWidth: '1.5' }} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="text-center mt-20 text-gray-200 animate-fadeIn text-sm sm:text-base">
              👋 Bienvenido {session.user?.name || "atleta"} <br />
              <span className="text-gray-400">
                Empieza a chatear con tu entrenador personal IA.
              </span>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 sm:p-5 rounded-2xl max-w-[90%] sm:max-w-2xl w-fit break-words shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white self-end ml-auto rounded-br-none"
                  : "bg-white/90 text-gray-800 mr-auto rounded-bl-none border border-gray-200"
              }`}
            >
              <div className="prose prose-sm sm:prose-base max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>

              {msg.role === "assistant" && isRoutineMessage(msg.content) && (
                <button
                  onClick={() => handleSaveRoutine(msg.content)}
                  className="mt-3 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Guardar rutina
                </button>
              )}

              {msg.role === "assistant" && isNutritionMessage(msg.content) && (
                <button
                  onClick={() => handleSaveNutrition(msg.content)}
                  className="mt-3 ml-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Guardar nutrición
                </button>
              )}
            </motion.div>
          ))}

          {typingMessage && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="bg-white/90 border border-gray-200 text-gray-800 p-4 rounded-2xl w-fit mr-auto rounded-bl-none shadow-sm"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {typingMessage + "▋"}
              </ReactMarkdown>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* INPUT */}
        <footer className="p-3 sm:p-4 bg-white/10 backdrop-blur-md border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border border-white/20 bg-white/20 text-white placeholder-gray-300 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-2xl transition shadow-md disabled:opacity-50 text-sm sm:text-base"
          >
            Enviar
          </button>
        </footer>
      </div>
    </div>
  );
}
