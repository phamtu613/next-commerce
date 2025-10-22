import { compareSync } from 'bcryptjs';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';

export const authOptions: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = compareSync(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // JWT callback
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // Nếu user chưa có name, dùng email trước @ làm name
        if (!user.name || user.name === 'NO_NAME') {
          const newName = user.email!.split('@')[0];
          token.name = newName;

          // Update trong DB
          await prisma.user.update({
            where: { id: user.id },
            data: { name: newName },
          });
        } else {
          token.name = user.name;
        }
      }

      // Handle cập nhật session (name change)
      if (trigger === 'update' && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },

    // Session callback
    async session({ session, token, trigger }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }

      // Optionally handle name update
      if (trigger === 'update' && token.name) {
        session.user.name = token.name as string;
      }

      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
