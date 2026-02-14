import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// ============================================================================
// Type Extensions for NextAuth Session
// ============================================================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
      patientId?: string | null;
    };
  }

  interface User {
    role?: UserRole;
    patientId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    patientId?: string | null;
  }
}

// ============================================================================
// NextAuth Configuration
// ============================================================================

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials provider for email/password authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        // TODO: Add password verification when implementing password hashing
        // const isValid = await bcrypt.compare(credentials.password, user.password);
        // if (!isValid) {
        //   throw new Error('Invalid password');
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          patientId: user.patient?.id ?? null,
        };
      },
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Apple OAuth provider
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role ?? UserRole.PATIENT;
        token.patientId = user.patientId ?? null;
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.patientId = session.patientId ?? token.patientId;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.patientId = token.patientId ?? null;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Additional sign in logic can be added here
      // For example: email verification, domain restrictions, etc.
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
      // TODO: Send welcome email, create patient record, etc.
    },

    async signIn({ user, isNewUser }) {
      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    },

    async signOut({ token }) {
      // Clean up session data if needed
      console.log(`User signed out: ${token?.id}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// ============================================================================
// Helper Functions
// ============================================================================

export { prisma };

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is a patient
 */
export function isPatient(role: UserRole): boolean {
  return role === UserRole.PATIENT;
}

/**
 * Check if user is a doctor
 */
export function isDoctor(role: UserRole): boolean {
  return role === UserRole.DOCTOR;
}

/**
 * Check if user is an admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}
