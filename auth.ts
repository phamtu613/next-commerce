import { prisma } from "@/db/prisma";
import { compareSync } from "bcrypt-ts-edge";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          type: "email",
        },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }: any) {
      // Check for cart cookie
      if (!request.cookies.get("sessionCartId")) {
        // Generate cart cookie
        const sessionCartId = crypto.randomUUID();

        // Clone the request headers
        const newRequestHeaders = new Headers(request.headers);

        // Create a new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Set the newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);

        // Return the response with the sessionCartId set
        return response;
      } else {
        return true;
      }
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = token.name ?? user.name;

        if (user.name === "NO_NAME") {
          const newName = token.name = user.email!.split("@")[0];

          await prisma.user.update({
            where: { id: user.id },
            data: { name: newName },
          });
          token.name = newName;
        }
      }

      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }
      console.log("✅ JWT token at end:", token); // Debug check
      return token;
    },
    async session({ session, token, trigger }: any) {
      session.user.id = token.id ?? token.sub;
      session.user.name = token.name;
      session.user.role = token.role;
      if (trigger === "update" && token.name) {
        session.user.name = token.name;
      }

      console.log("✅ Session:", session);
      return session;
    },
  },
});
