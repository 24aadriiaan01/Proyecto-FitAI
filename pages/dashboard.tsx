"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  TooltipProps,
} from "recharts";
import { motion } from "framer-motion";

interface ProgressEntry {
  id: number;
  date: string;
  weight: number;
  height?: number;
  notes?: string;
  bmi?: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [form, setForm] = useState({ weight: "", height: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [activeRecordTab, setActiveRecordTab] = useState<"workout" | "food">(
    "workout"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchProgress();
    }
  }, [status, router]);

  async function fetchProgress() {
    const res = await fetch("/api/progress"); // Llama a nuestra nueva API
    if (!res.ok) {
      console.error("Error al cargar el progreso");
      return;
    }
    const data = await res.json();

    const withBMI = data.map((entry: ProgressEntry) => {
      const heightM = entry.height ? entry.height / 100 : null;
      const bmi = heightM ? entry.weight / (heightM * heightM) : null;
      return { ...entry, bmi };
    });

    setProgress(withBMI);
  }

  async function addProgress() {
    if (!form.weight) {
      alert("El peso es un campo obligatorio.");
      return;
    }
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ weight: "", height: "", notes: "" }); // Limpiar formulario
    alert("✅ Registro de progreso guardado correctamente.");
    await fetchProgress(); // Recargar datos
    setLoading(false);
  }

  async function deleteProgress(id: number) {
    if (!confirm("¿Seguro que quieres eliminar este registro?")) return;
    try {
      await fetch("/api/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      alert("🗑️ Registro eliminado correctamente.");
      await fetchProgress(); // Recargar datos tras eliminar
    } catch (error) {
      console.error("Error al eliminar el progreso:", error);
      alert("No se pudo eliminar el registro.");
    }
  }

  // --- Lógica para el modal de añadir registro de ejercicio/dieta ---
  const [newWorkoutRecord, setNewWorkoutRecord] = useState({
    exerciseName: "",
    muscleGroup: "Pecho", // Valor inicial para el select
    repsAndWeight: "", // Nuevo campo para repeticiones y peso
  });
  const [newFoodRecord, setNewFoodRecord] = useState({
    foodItem: "",
    isHealthy: false,
    mealType: "",
  });

  async function handleAddWorkoutRecord() {
    if (!newWorkoutRecord.muscleGroup || !newWorkoutRecord.exerciseName || !newWorkoutRecord.repsAndWeight) {
      alert("El grupo muscular, el nombre del ejercicio y las repeticiones/peso son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/workout-session-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ // Actualizamos el cuerpo de la petición
          muscleGroup: newWorkoutRecord.muscleGroup,
          exerciseName: newWorkoutRecord.exerciseName,
          repsAndWeight: newWorkoutRecord.repsAndWeight,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar el entrenamiento.");
      alert("✅ Entrenamiento registrado correctamente.");
      setNewWorkoutRecord({
        exerciseName: "",
        muscleGroup: "",
        repsAndWeight: "",
      });
      setShowAddRecordModal(false);
      // No es necesario recargar el progreso del peso/IMC, pero sí se actualizarán los logros.
    } catch (error) {
      console.error("Error al añadir entrenamiento:", error);
      alert("No se pudo registrar el entrenamiento.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFoodRecord() {
    if (!newFoodRecord.foodItem || !newFoodRecord.mealType) {
      alert("El alimento y el tipo de comida son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/food-log-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFoodRecord),
      });
      if (!res.ok) throw new Error("Error al guardar la comida.");
      alert("✅ Comida registrada correctamente.");
      setNewFoodRecord({ foodItem: "", isHealthy: false, mealType: "" });
      setShowAddRecordModal(false);
      // No es necesario recargar el progreso del peso/IMC, pero sí se actualizarán los logros.
    } catch (error) {
      console.error("Error al añadir comida:", error);
      alert("No se pudo registrar la comida.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return <p className="text-center mt-20 text-white">Cargando...</p>;
  if (!session) return null;

  const CustomLegend = () => (
    <div className="flex flex-wrap gap-4 items-center justify-center text-sm mt-4 text-gray-200">
      <div className="flex items-center gap-1">
        <span className="block w-4 h-1 bg-[#1E90FF]" />
        <span>Peso</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="block w-4 h-1 bg-[#FF7F50]" />
        <span>IMC</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="block w-4 h-4 bg-green-300/40 border border-green-400 rounded-sm" />
        <span>Zona saludable de IMC (18.5 – 24.9)</span>
      </div>
    </div>
  );

  // Lista de grupos musculares para el select
  const muscleGroups = [
    "Pecho",
    "Hombro",
    "Triceps",
    "Biceps",
    "Espalda",
    "Pierna",
    "Abdominales",
  ];
  return (
    <div className="relative min-h-screen flex flex-col">
      <Sidebar />
      {/* Fondo igual al del chat */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/gym-bg3.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-800/40 backdrop-blur-[2px]"></div>
      {/* Contenido */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Título y Botón de Acción */}
        <div className="text-center pt-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Panel de Progreso
          </h1>
          <button
            onClick={() => setShowAddRecordModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md"
          >
            Añadir registro de ejercicio/dieta
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-6 sm:p-10 space-y-10 text-white">
          {/* TARJETAS RESUMEN */}
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl text-center border border-white/10">
              <p className="text-sm text-gray-300">Peso actual</p>
              <p className="text-2xl font-semibold text-blue-400">
                {progress.at(-1)?.weight ?? "-"} kg
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl text-center border border-white/10">
              <p className="text-sm text-gray-300">IMC actual</p>
              <p className="text-2xl font-semibold text-green-400">
                {progress.at(-1)?.bmi?.toFixed(1) ?? "-"}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl text-center border border-white/10">
              <p className="text-sm text-gray-300">Promedio IMC</p>
              <p className="text-2xl font-semibold text-yellow-400">
                {progress.length
                  ? (
                      progress.reduce((acc, e) => acc + (e.bmi ?? 0), 0) /
                      progress.length
                    ).toFixed(1)
                  : "-"}
              </p>
            </div>
          </div>

          {/* GRÁFICO */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Evolución de tu peso e IMC</h2>
            {progress.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString()}
                    stroke="#ccc"
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#ccc"
                    label={{
                      value: "Peso (kg)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#ccc",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#ccc"
                    label={{
                      value: "IMC",
                      angle: 90,
                      position: "insideRight",
                      fill: "#ccc",
                    }}
                    domain={[10, 35]}
                  />

                  <ReferenceArea
                    yAxisId="right"
                    y1={18.5}
                    y2={24.9}
                    strokeOpacity={0}
                    fill="#86efac"
                    fillOpacity={0.2}
                    ifOverflow="extendDomain"
                  />

                  <Tooltip
                    contentStyle={{ backgroundColor: "#333", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value, name) => {
                      if (typeof value !== 'number') return value;
                      if (name === "IMC") return value.toFixed(2);
                      if (name === "Peso") return `${value} kg`;
                      return value;
                    }
                    }
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  />

                  <Legend content={<CustomLegend />} />

                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="#1E90FF"
                    strokeWidth={3}
                    dot={false}
                    name="Peso"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bmi"
                    stroke="#FF7F50"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    name="IMC"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Aún no hay registros.</p>
            )}
          </div>

          {/* FORM + HISTORIAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FORM */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-[320px] flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4">Agregar registro</h2>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Peso (kg)"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full border border-white/20 bg-white/20 text-white placeholder-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                  <input
                    type="number"
                    placeholder="Altura (cm)"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="w-full border border-white/20 bg-white/20 text-white placeholder-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                  <input
                    type="text"
                    placeholder="Notas (opcional)"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-white/20 bg-white/20 text-white placeholder-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
              </div>
              <button
                onClick={addProgress}
                disabled={loading}
                className="w-full mt-4 bg-blue-600/80 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                {loading ? "Guardando..." : "Guardar registro"}
              </button>
            </div>

            {/* HISTORIAL */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-[320px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Historial de registros</h2>
              <ul className="space-y-2 overflow-y-auto">
                {progress
                  .slice(-4)
                  .reverse()
                  .map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between items-center bg-white/10 border border-white/10 p-3 rounded-lg"
                    >
                      <span>
                        {new Date(p.date).toLocaleDateString()} — {p.weight} kg{" "}
                        {p.bmi && (
                          <span className="text-gray-400">
                            (IMC: {p.bmi.toFixed(2)})
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => deleteProgress(p.id)}
                        className="text-red-400 hover:text-red-500 transition"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </main>

        {/* Modal para añadir registro de ejercicio/dieta */}
        {showAddRecordModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md text-white relative"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                Añadir nuevo registro
              </h2>

              {/* Tabs para seleccionar tipo de registro */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setActiveRecordTab("workout")}
                  className={`px-5 py-2 rounded-l-lg transition-colors ${
                    activeRecordTab === "workout"
                      ? "bg-blue-600 text-white"
                      : "bg-white/20 text-gray-300 hover:bg-white/30"
                  }`}
                >
                  Entrenamiento
                </button>
                <button
                  onClick={() => setActiveRecordTab("food")}
                  className={`px-5 py-2 rounded-r-lg transition-colors ${
                    activeRecordTab === "food"
                      ? "bg-green-600 text-white"
                      : "bg-white/20 text-gray-300 hover:bg-white/30"
                  }`}
                >
                  Comida
                </button>
              </div>

              {/* Formulario de Entrenamiento */}
              {activeRecordTab === "workout" && (
                <div className="space-y-4">
                  {/* Select para Grupo Muscular */}
                  <select
                    value={newWorkoutRecord.muscleGroup}
                    onChange={(e) =>
                      setNewWorkoutRecord({
                        ...newWorkoutRecord,
                        muscleGroup: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="" disabled className="text-gray-800">
                      Selecciona Grupo Muscular
                    </option>
                    {muscleGroups.map((group) => (
                      <option key={group} value={group} className="text-gray-800">
                        {group}
                      </option>
                    ))}
                  </select>

                  {/* Input para Ejercicio Hecho */}
                  <input
                    type="text"
                    placeholder="Ejercicio hecho (ej: Press Banca)"
                    value={newWorkoutRecord.exerciseName}
                    onChange={(e) =>
                      setNewWorkoutRecord({
                        ...newWorkoutRecord,
                        exerciseName: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  {/* Input para Repeticiones y Peso */}
                  <input
                    type="text"
                    placeholder="Repeticiones y peso (ej: 3x10 60kg)"
                    value={newWorkoutRecord.repsAndWeight}
                    onChange={(e) =>
                      setNewWorkoutRecord({
                        ...newWorkoutRecord,
                        repsAndWeight: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  <button
                    onClick={handleAddWorkoutRecord}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md"
                  >
                    {loading ? "Guardando..." : "Registrar Entrenamiento"}
                  </button>
                </div>
              )}

              {/* Formulario de Comida */}
              {activeRecordTab === "food" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Alimento (ej: Pechuga de pollo con arroz)"
                    value={newFoodRecord.foodItem}
                    onChange={(e) =>
                      setNewFoodRecord({
                        ...newFoodRecord,
                        foodItem: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <select
                    value={newFoodRecord.mealType}
                    onChange={(e) =>
                      setNewFoodRecord({
                        ...newFoodRecord,
                        mealType: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="" disabled className="text-gray-800">
                      Tipo de comida
                    </option>
                    <option value="Desayuno" className="text-gray-800">Desayuno</option>
                    <option value="Almuerzo" className="text-gray-800">Almuerzo</option>
                    <option value="Comida" className="text-gray-800">Comida</option>
                    <option value="Merienda" className="text-gray-800">Merienda</option>
                    <option value="Cena" className="text-gray-800">Cena</option>
                    <option value="Snack" className="text-gray-800">Snack</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isHealthy"
                      checked={newFoodRecord.isHealthy}
                      onChange={(e) =>
                        setNewFoodRecord({
                          ...newFoodRecord,
                          isHealthy: e.target.checked,
                        })
                      }
                      className="form-checkbox h-5 w-5 text-green-600 rounded"
                    />
                    <label htmlFor="isHealthy" className="text-gray-300">
                      ¿Es una comida saludable?
                    </label>
                  </div>
                  <button
                    onClick={handleAddFoodRecord}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md"
                  >
                    {loading ? "Guardando..." : "Registrar Comida"}
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowAddRecordModal(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white transition"
              >
                ✖
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
