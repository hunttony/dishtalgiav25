import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { clientPromise } from '@/lib/mongodb';
import { compare } from 'bcryptjs';
import type { Adapter } from 'next-auth/adapters';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  }
}

// Create auth options
const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB,
  }) as Adapter,

  // Cookie settings
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.dishtalgia-v3.vercel.app' : undefined,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.dishtalgia-v3.vercel.app' : undefined,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const user = await db.collection('users').findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name 
        } as const;
      }
    })
  ],
  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // JWT configuration
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Add role to the session
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  // Ensure we're using the correct URL in production
  // baseUrl is not a valid option in this version, using NEXTAUTH_URL environment variable instead
  // Custom logger
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(code, metadata);
      }
    },
  },
};

// Export the handler for NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
