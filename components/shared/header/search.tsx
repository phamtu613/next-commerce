"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchProps {
  categories: Array<{ category: string }>;
}

const Search = ({ categories }: SearchProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q")?.toString() || "";
    const cat = formData.get("category")?.toString() || "all";

    const params = new URLSearchParams(searchParams.toString());

    if (q && q.trim() !== "") {
      params.set("q", q);
    } else {
      params.delete("q");
    }

    if (cat && cat !== "all") {
      params.set("category", cat);
    } else {
      params.delete("category");
    }

    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Select name="category" value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={"All"} value={"all"}>
              All
            </SelectItem>
            {categories.map((x) => (
              <SelectItem key={x.category} value={x.category}>
                {x.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          name="q"
          type="text"
          placeholder="Search..."
          className="md:w-[100px] lg:w-[300px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
};

export default Search;
