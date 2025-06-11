import type { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
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

export const authOptions: NextAuthOptions = {
  // Configure MongoDB adapter
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB,
  }) as Adapter,
  
  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours
    updateAge: 60 * 60, // 1 hour
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 12 * 60 * 60, // 12 hours
  },
  
  // Use secure cookies in production
  useSecureCookies: isProduction,
  
  // Cookie settings - simplified for better compatibility
  cookies: {
    sessionToken: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: 12 * 60 * 60, // 12 hours
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
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
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
    }
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
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/', // Redirect to home after sign out
    newUser: '/onboarding', // New users will be directed here on first sign in
  },
  
  // Secret key for signing tokens - must be set in production
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug settings
  logger: {
    error(code: string, metadata: unknown) {
      console.error('Auth error:', code, metadata);
    },
    warn(code: string) {
      console.warn('Auth warning:', code);
    },
    debug(code: string, metadata: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth debug:', code, metadata);
      }
    },
  },
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Event handlers
  events: {
    async signOut({ token }) {
      try {
        // Clear any stored tokens in the database
        if (token?.sessionToken) {
          try {
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB);
            await db.collection('sessions').deleteMany({ sessionToken: token.sessionToken });
          } catch (dbError) {
            console.error('Error cleaning up database session:', dbError);
          }
        }
      } catch (error) {
        console.error('Error during sign out:', error);
      }
    },
  },
};

export default authOptions;
