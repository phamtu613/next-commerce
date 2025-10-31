import { getAllCategories } from "@/lib/actions/product.actions";
import { APP_NAME } from "@/lib/constants";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import CategoriesDrawer from "./header/categories-drawer";
import Search from "./header/search";
import UserButton from "./user-button";

const Header = async () => {
  const categories = await getAllCategories();

  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="wrapper flex-between py-4">
        <div className="flex items-center">
          <CategoriesDrawer />
          <Link href={ROUTES.HOME} className="h3-bold ml-4">
            {APP_NAME}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <Search categories={categories} />
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
