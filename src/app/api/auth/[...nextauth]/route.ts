import NextAuth from 'next-auth';
import { authOptions } from './config';

// Create and export the auth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
