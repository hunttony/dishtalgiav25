import type { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from '@/lib/mongodb';
const bcrypt = require('bcryptjs');
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
    accessToken?: string;
    provider?: string;
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    image?: string | null;
  }
  
  interface JWT {
    sub: string;
    role?: string;
    provider?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    role?: string;
    provider?: string;
    accessToken?: string;
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

        const isValid = await bcrypt.compare(credentials.password, user.password);
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
  
  // Callbacks - Handle JWT and session management
  callbacks: {
    /**
     * JWT Callback - Called whenever a JSON Web Token is created or updated
     */
    async jwt({ token, user, account }) {
      // Initial sign in - add user info to the token
      if (user) {
        token.sub = user.id;
        token.role = user.role || 'user';
        
        // Add OAuth provider data if available
        if (account) {
          token.provider = account.provider;
          
          // Store OAuth access token if available
          if (account.access_token) {
            token.accessToken = account.access_token;
          }
        }
      }
      
      // Return previous token if the callback was not triggered by a sign in
      return token;
    },
    
    /**
     * Session Callback - Controls what gets returned when using getSession() or useSession()
     */
    async session({ session, token }) {
      // Add user ID and role to the session
      if (session.user) {
        session.user.id = token.sub || '';
        session.user.role = (token.role as string) || 'user';
        
        // Add any additional token data to the session if needed
        if (token.accessToken) {
          (session as any).accessToken = token.accessToken;
        }
        
        if (token.provider) {
          (session as any).provider = token.provider;
        }
      }
      
      return session;
    },
    
    /**
     * Sign In Callback - Called when a user signs in
     */
    async signIn() {
      // You can add custom validation here
      const isAllowedToSignIn = true; // Add your custom logic here
      
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized';
      }
    },
    
    /**
     * Redirect Callback - Controls the redirect after sign in/sign out
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  
  // Event handlers
  events: {
    async signOut({ token }) {
      try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        
        // Delete all sessions for this user
        if (token?.sub) {
          await db.collection('sessions').deleteMany({ userId: token.sub });
        }
        
        // Also try to delete by session token if available
        if (token?.sessionToken) {
          await db.collection('sessions').deleteMany({ sessionToken: token.sessionToken });
        }
        
        // Clear any other related data if needed
        await db.collection('accounts').deleteMany({ userId: token?.sub });
        
        console.log('Successfully cleaned up user session data');
      } catch (error) {
        console.error('Error during sign out cleanup:', error);
        // Don't rethrow to prevent signout from failing
      }
    },
  },
};

export default authOptions;
