"use client";

import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
export const dynamic = "force-dynamic"
const links = [
  {
    title: "Overview",
    href: ROUTES.ADMIN.BASE + "/overview",
  },
  {
    title: "Products",
    href: ROUTES.ADMIN.PRODUCTS,
  },
  {
    title: "Orders",
    href: ROUTES.ADMIN.ORDERS,
  },
  {
    title: "Users",
    href: ROUTES.ADMIN.USERS,
  },
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.includes(item.href) ? "" : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export default MainNav;
