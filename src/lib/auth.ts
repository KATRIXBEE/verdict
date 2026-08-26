import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth.js Configuration for VERDICT
 * Phase 1: Anonymous / Demo Session Provider
 * Phase 2: DigiLocker Sandbox OAuth Provider (when production client credentials are configured)
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "anonymous-citizen",
      name: "Anonymous Citizen",
      credentials: {
        userName: { label: "Display Name", type: "text" },
        constituency: { label: "Constituency", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userName) return null;
        return {
          id: `anon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: credentials.userName,
          email: undefined,
          // Until official DigiLocker OAuth handshake is completed, claim remains false
          digilockerVerified: false,
          isLocalVoter: false,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.digilockerVerified = false; // Always false until cryptographic DigiLocker OAuth
        token.isLocalVoter = false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).digilockerVerified = false;
        (session.user as any).isLocalVoter = false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "verdict-secret-token-key-change-in-production-min32chars",
};
