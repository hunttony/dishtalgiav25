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

// Helper to determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Create auth options
const authOptions: NextAuthOptions = {
  // Configure MongoDB adapter
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB,
  }) as Adapter,
  
  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secret: process.env.NEXTAUTH_SECRET,
  },

  // Ensure we're using secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',

  // Cookie settings
  cookies: {
    sessionToken: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        // Let the browser handle the domain in production
      },
    },
    callbackUrl: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${isProduction ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const user = await db.collection('users').findOne({ 
          email: credentials.email.toLowerCase()
        });

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
          name: user.name,
          role: user.role || 'user'
        };
      }
    })
  ],

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Add user ID and role to the token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID and role to the session
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Secret key for signing tokens
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug mode in development
  debug: !isProduction,
  
  // Security settings are now at the top level
  // Ensure cookies are properly cleared on sign out
  events: {
    async signOut({ token }) {
      if (token?.sessionToken) {
        // NextAuth will handle clearing the session cookie
        // We'll rely on the built-in cookie clearing mechanism
        // by letting NextAuth handle the session invalidation
      }
    },
  },

  // Logger configuration
  logger: {
    error(code, metadata) {
      console.error('Auth error:', code, metadata);
    },
    warn(code) {
      console.warn('Auth warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Auth debug:', code, metadata);
      }
    },
  },
};

// Create and export the auth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
