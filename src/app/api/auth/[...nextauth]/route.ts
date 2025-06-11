import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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

// Create auth options
const authOptions: NextAuthOptions = {
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
  
  // Cookie settings
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
  // Handle sign out and sign in events
  events: {
    async signOut({ token }) {
      try {
        // Clear all auth-related cookies using document.cookie
        if (typeof document !== 'undefined') {
          // Clear all possible auth cookies
          const cookieNames = [
            // Session tokens
            '__Secure-next-auth.session-token',
            'next-auth.session-token',
            // Callback URLs
            '__Secure-next-auth.callback-url',
            'next-auth.callback-url',
            // CSRF tokens
            '__Secure-next-auth.csrf-token',
            'next-auth.csrf-token',
            // State parameters
            '__Secure-next-auth.state',
            'next-auth.state',
            // PKCE code verifier
            '__Secure-next-auth.pkce.code_verifier',
            'next-auth.pkce.code_verifier'
          ];
          
          // Delete each cookie
          cookieNames.forEach(cookieName => {
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${isProduction ? 'Secure; ' : ''}SameSite=Lax`;
          });
        }
        
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
    async signIn() {
      try {
        // Clear any stale sessions on new sign in
        if (typeof document !== 'undefined') {
          // Clear session tokens
          document.cookie = `__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${isProduction ? 'Secure; ' : ''}SameSite=Lax`;
          document.cookie = `next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${isProduction ? 'Secure; ' : ''}SameSite=Lax`;
          
          // Clear any stored state
          try {
            localStorage.removeItem('nextauth.message');
            sessionStorage.clear();
          } catch (storageError) {
            console.error('Error clearing storage:', storageError);
          }
        }
      } catch (error) {
        console.error('Error during sign in cleanup:', error);
      }
    },
  },

  // Logger configuration
  logger: {
    error: (code: string, metadata: unknown) => {
      console.error('Auth error:', code, metadata);
    },
    warn: (code: string) => {
      console.warn('Auth warning:', code);
    },
    debug: (code: string, metadata: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Auth debug:', code, metadata);
      }
    },
  },
};

// Create and export the auth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
