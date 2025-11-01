import AdminSearch from "@/components/shared/admin-search";
import UserButton from "@/components/shared/user-button";
import { APP_NAME } from "@/lib/constants";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import MainNav from "./main-nav";
export const dynamic = "force-dynamic"; // Next.js 13+ App Router
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col">
        <div className="border-b container mx-auto">
          <div className="flex h-16 items-center px-4">
            <Link href={ROUTES.HOME} className="w-22">
              <span className="text-2xl font-bold text-indigo-600">
                {APP_NAME}
              </span>
            </Link>
            <div className="ml-auto flex items-center space-x-4">
              <AdminSearch />
              <MainNav className="mx-6" />
              <UserButton />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
