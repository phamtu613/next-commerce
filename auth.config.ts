// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig: NextAuthConfig = {
  providers: [], // ⚠️ phải có, sẽ override trong auth.ts
  callbacks: {
    authorized({ request, auth }: any) {
      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID();
        const response = NextResponse.next({
          request: { headers: new Headers(request.headers) },
        });
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = token.name ?? user.name;

        if (user.name === "NO_NAME") {
          const newName = (token.name = user.email!.split("@")[0]);
          await (await import("@/db/prisma")).prisma.user.update({
            where: { id: user.id },
            data: { name: newName },
          });
          token.name = newName;
        }
      }
      if (trigger === "update" && session?.user?.name) token.name = session.user.name;
      return token;
    },
    async session({ session, token, trigger }: any) {
      session.user.id = token.id ?? token.sub;
      session.user.name = token.name;
      session.user.role = token.role;
      if (trigger === "update" && token.name) session.user.name = token.name;
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
};
