import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: "st-elias-ministry-secret-key-2024",
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // Legacy user without password — migrate on first login
        if (!user.password) {
          if (password === "testpassword123") {
            const hashed = bcrypt.hashSync(password, 10);
            await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
            return { id: user.id, email: user.email, name: user.name };
          }
          return null;
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { role: true, organization: true },
        });
        token.role = dbUser?.role || "ORGANIZER";
        token.organization = dbUser?.organization || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organization = token.organization as string | undefined;
      }
      return session;
    },
  },
});
