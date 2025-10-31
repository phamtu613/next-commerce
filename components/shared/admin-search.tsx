"use client";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const AdminSearch = () => {
  const pathname = usePathname();
  const formActionUrl = pathname.includes(ROUTES.ADMIN.ORDERS)
    ? ROUTES.ADMIN.ORDERS
    : pathname.includes(ROUTES.ADMIN.USERS)
    ? ROUTES.ADMIN.USERS
    : ROUTES.ADMIN.PRODUCTS;

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "");

  useEffect(() => {
    setQueryValue(searchParams.get("query") || "");
  }, [searchParams]);

  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:w-[100px] lg:w-[300px]"
      />
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
};

export default AdminSearch;
