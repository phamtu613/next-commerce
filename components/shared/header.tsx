import Link from "next/link";
import UserButton from "./user-button";

const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="wrapper flex-between py-4">
        <Link href="/" className="h3-bold">
          Tony Store
        </Link>
        <UserButton />
      </div>
    </header>
  );
};

export default Header;
