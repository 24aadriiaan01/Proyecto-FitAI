import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Salad,
  MessageSquare,
  LineChart,
  Lightbulb,
  Star,
} from "lucide-react";

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
    },
  }),
};

export default function HomePage() {
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    type: "sugerencia",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({ submitting: false, message: "" });

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ submitting: true, message: "" });

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Algo salió mal.");
      }

      setFormStatus({ submitting: false, message: "¡Gracias por tu feedback! Lo hemos recibido correctamente." });
      setFeedback({ name: "", email: "", type: "sugerencia", message: "" }); // Limpiar formulario
    } catch (error: any) {
      setFormStatus({ submitting: false, message: `Error: ${error.message}` });
    }
  };
  return (
    <>
      <Head>
        <title>FitAI - Tu Entrenador Personal Inteligente</title>
        <meta
          name="description"
          content="Revoluciona tu entrenamiento y nutrición con FitAI. Planes personalizados, seguimiento de progreso y un chat con IA para alcanzar tus metas."
        />
      </Head>

      <div className="bg-gray-900 text-white">
        {/* Hero Section */}
        <main className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden p-4">
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
          ></div>
          {/* Animación de fondo dinámica */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div
              animate={{ y: [0, -20, 0], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-1/3 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 25, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"
            />
          </div>

          <div className="absolute inset-0 bg-black/70 z-10"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative z-20"
          >
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg"
            >
              FitAI
            </motion.h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-200 mb-10 leading-relaxed">
              Transforma tu físico con el poder de la inteligencia artificial.
              Entrenamientos, nutrición y seguimiento, todo en un solo lugar.
            </p>
            <div className="flex justify-center items-center gap-4">
              {/* Botón de CTA animado */}
              <motion.div animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 30px rgba(59,130,246,0.5)", "0 0 0 rgba(0,0,0,0)"] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl text-lg transition-transform transform hover:scale-105 shadow-lg whitespace-nowrap">
                  Únete a la Revolución
                </Link>
              </motion.div>
              <Link href="/login" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-10 rounded-xl text-lg transition-transform transform hover:scale-105 shadow-lg">
                Iniciar Sesión
              </Link>
            </div>
          </motion.div>
        </main>

        {/* Features Section */}
        <section className="py-20 bg-gray-800/50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-md">Todo lo que necesitas para triunfar</h2>
            <p className="text-gray-300 mb-12 text-lg max-w-3xl mx-auto">
              Herramientas inteligentes diseñadas para maximizar tu potencial.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Dumbbell, title: "Planes a Medida", desc: "Rutinas de entrenamiento que se adaptan a tu nivel y objetivos." },
                { icon: Salad, title: "Nutrición Inteligente", desc: "Planes de alimentación para complementar tu esfuerzo en el gimnasio." },
                { icon: MessageSquare, title: "Chat con IA", desc: "Tu entrenador personal disponible 24/7 para resolver tus dudas." },
                { icon: LineChart, title: "Progreso Visual", desc: "Gráficos y estadísticas para ver tu evolución y mantener la motivación." },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                  className="bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-blue-500 transition-all duration-300 group"
                >
                  <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:text-purple-400 transition-colors" />
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sección de "Cómo funciona" */}
        <section className="py-20 bg-gray-900/70">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-12 text-white drop-shadow-md">Cómo funciona FitAI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1️⃣", title: "Crea tu cuenta", desc: "Regístrate y completa tu perfil para que la IA conozca tus objetivos." },
                { step: "2️⃣", title: "Entrena y come inteligente", desc: "Recibe rutinas y planes personalizados ajustados a ti." },
                { step: "3️⃣", title: "Mide tu progreso", desc: "Sigue tu evolución y desbloquea logros al alcanzar tus metas." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0,0,0,0.4)" }}
                  className="bg-white/5 p-8 rounded-2xl border border-white/10 transition-all duration-300"
                >
                  <div className="text-5xl mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-br from-gray-800 to-gray-700">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-12 text-white drop-shadow-md">Lo que dicen nuestros atletas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                className="bg-white/15 p-8 rounded-2xl text-left border border-white/20 hover:border-yellow-400 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <img src="/images/avatar-predefinido.png" alt="Usuario 1" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">Carlos R.</p>
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current stroke-current" />)}</div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"FitAI ha cambiado mi forma de entrenar. El chat con la IA es increíblemente útil y los planes se sienten realmente personalizados. ¡He visto más progreso en 3 meses que en el último año!"</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                className="bg-white/15 p-8 rounded-2xl text-left border border-white/20 hover:border-yellow-400 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <img src="/images/avatar-predefinido.png" alt="Usuario 2" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">Ana G.</p>
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current stroke-current" />)}</div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"La sección de nutrición es justo lo que necesitaba. Combinar las rutinas con un plan de comidas claro ha sido clave para alcanzar mi objetivo de pérdida de peso. ¡Totalmente recomendado!"</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sección de "Logros y retos" */}
        <section className="py-20 bg-gray-800/60 text-center">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-10 text-white drop-shadow-md">🏆 Logros y Retos</h2>
            <p className="text-gray-300 mb-12 max-w-3xl mx-auto">
              Completa entrenamientos, sigue tu nutrición y alcanza tus metas para desbloquear insignias exclusivas.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <motion.img src="/images/leyenda-gimnasio.png" alt="Leyenda de Gimnasio" className="w-28 h-28 object-contain hover:scale-110 transition-transform" />
              <motion.img src="/images/camino-heroe.png" alt="Camino de Heroe" className="w-32 h-32 object-contain hover:scale-110 transition-transform" />
              <motion.img src="/images/nutricionista-experto.png" alt="Nutricionista Experto" className="w-26 h-26 object-contain hover:scale-110 transition-transform" />
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="py-20 bg-gray-900/70">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-md">¿Tienes una idea para mejorar FitAI?</h2>
              <p className="text-gray-300 mb-12 text-lg max-w-3xl mx-auto">
                Tu opinión es clave para construir el futuro de la plataforma. Comparte tus sugerencias, informa de errores o propón nuevas funcionalidades. ¡Te escuchamos!
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleFeedbackSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl mx-auto mt-10 text-left bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" name="name" placeholder="Nombre" value={feedback.name} onChange={handleFeedbackChange} required className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input type="email" name="email" placeholder="Correo electrónico" value={feedback.email} onChange={handleFeedbackChange} required className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="mb-4">
                <select name="type" value={feedback.type} onChange={handleFeedbackChange} className="w-full p-3 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="sugerencia" className="text-black">Sugerencia</option>
                  <option value="mejora" className="text-black">Propuesta de Mejora</option>
                  <option value="bug" className="text-black">Reportar un Error (Bug)</option>
                </select>
              </div>
              <div className="mb-6">
                <textarea
                  name="message"
                  placeholder="Tu mensaje..."
                  required
                  rows={4}
                  value={feedback.message}
                  onChange={handleFeedbackChange}
                  className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                disabled={formStatus.submitting}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-xl text-lg transition-transform transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus.submitting ? "Enviando..." : "Enviar Feedback"}
              </button>
              {formStatus.message && (
                <p className={`mt-4 text-center text-sm ${formStatus.message.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                  {formStatus.message}
                </p>
              )}
            </motion.form>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 text-center bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-md">¿Listo para empezar tu transformación?</h2>
            <p className="text-gray-300 mb-8 text-xl max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están alcanzando sus metas con FitAI.
            </p>
            <Link href="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg">
              Crear mi cuenta gratis
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/80 border-t border-white/10 py-8 text-center">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} FitAI. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </>
  );
}
