"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router"; // Corrected import for Pages Router
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  Dumbbell,
  Salad,
  LogOut,
  Menu,
  X,
  Star,
  Heart,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Progreso" },
  { href: "/profile-view", icon: User, label: "Perfil" },
  { href: "/chat", icon: MessageSquare, label: "FitAI Chat" },
  { href: "/routines", icon: Dumbbell, label: "Rutinas" },
  { href: "/nutritions", icon: Salad, label: "Nutrición" },
  { href: "/achievements", icon: Star, label: "Logros" },
  { href: "/friends", icon: Users, label: "Amigos" },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const sidebarVariants: Variants = {
    open: {
      x: 0,  
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }, 
    },
  };

  return (
    <>
      {/* Botón para abrir/cerrar en móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 h-full w-64 bg-gray-900/80 backdrop-blur-lg border-r border-white/10 shadow-2xl z-50 flex flex-col"
            >
              {/* Perfil del usuario */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              {/* Navegación */}
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      router.pathname === item.href
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Cerrar Sesión */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}