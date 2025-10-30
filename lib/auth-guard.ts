import { auth } from "@/auth";
import { ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect(ROUTES.HOME);
  }

  return session;
}
