import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({ where: { email: credentials.email } });

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          // El id ya es un string (cuid), no necesita .toString()
          return { id: user.id, name: user.name, email: user.email };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null; // Devuelve null si hay cualquier error
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // En el inicio de sesión inicial, el objeto 'user' está disponible.
      // Persistimos los datos que queremos en el token.
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // El token contiene ahora todos los datos que necesitamos.
      // Reconstruimos el objeto `user` de la sesión para garantizar que tenga la estructura correcta.
      return {
        ...session,
        user: {
          ...session.user, // Mantenemos propiedades por defecto como 'image'
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
        },
      };
    },
  },
};

export default NextAuth(authOptions);
