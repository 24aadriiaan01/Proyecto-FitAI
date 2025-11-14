import { Server } from "socket.io";
import { seedAchievementsIfNeeded } from "@/lib/achievements"; // 1. Importamos la función

const SocketHandler = async (req: any, res: any) => { // 2. Convertimos la función en async
  if (res.socket.server.io) {
    res.end();
    return;
  }

  // 3. Ejecutamos la función para crear los logros en la BD si no existen
  await seedAchievementsIfNeeded();

  const io = new Server(res.socket.server, {
    path: "/api/socket_io",
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send_message", (msg) => {
      io.to(msg.roomId).emit("receive_message", msg);
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });

  res.end();
};

export default SocketHandler;
