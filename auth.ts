import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { isAdminEmail } from "@/lib/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    jwt({ token }) {
      token.isAdmin = isAdminEmail(token.email);
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
});
