import Header from "@/components/shared/header";
import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/shared/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product.actions";
import { Filter, Star, X } from "lucide-react";
import Link from "next/link";

const prices = [
  {
    name: "$1 to $50",
    value: "1-50",
  },
  {
    name: "$51 to $100",
    value: "51-100",
  },
  {
    name: "$101 to $200",
    value: "101-200",
  },
  {
    name: "$201 to $500",
    value: "201-500",
  },
  {
    name: "$501 to $1000",
    value: "501-1000",
  },
];

const ratings = [4, 3, 2, 1];

const sortOrders = ["newest", "lowest", "highest", "rating"];

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;

  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
  }) => {
    const params: Record<string, string> = {
      q,
      category,
      price,
      rating,
      sort,
      page,
    };
    if (c) params.category = c;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;
    if (s) params.sort = s;
    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const categories = await getAllCategories();

  const products = await getAllProducts({
    category,
    query: q,
    price,
    rating,
    page: Number(page),
    sort,
  });

  const hasActiveFilters =
    (q !== "all" && q !== "") ||
    (category !== "all" && category !== "") ||
    price !== "all" ||
    rating !== "all";

  return (
    <>
      <Header />
      <div className="wrapper py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Department</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href={getFilterUrl({ c: "all" })}
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                          category === "all" || category === ""
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent"
                        }`}
                      >
                        Any
                      </Link>
                    </li>
                    {categories.map((x) => (
                      <li key={x.category}>
                        <Link
                          href={getFilterUrl({ c: x.category })}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            x.category === category
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-accent"
                          }`}
                        >
                          <span>{x.category}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {x._count}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Price Range</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href={getFilterUrl({ p: "all" })}
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                          price === "all"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent"
                        }`}
                      >
                        Any
                      </Link>
                    </li>
                    {prices.map((p) => (
                      <li key={p.value}>
                        <Link
                          href={getFilterUrl({ p: p.value })}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            p.value === price
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-accent"
                          }`}
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Customer Review
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href={getFilterUrl({ r: "all" })}
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                          rating === "all"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent"
                        }`}
                      >
                        Any
                      </Link>
                    </li>
                    {ratings.map((r) => (
                      <li key={r}>
                        <Link
                          href={getFilterUrl({ r: `${r}` })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                            r.toString() === rating
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-accent"
                          }`}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {r} stars & up
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {hasActiveFilters && (
                  <>
                    <span className="text-sm font-medium">Active filters:</span>
                    {q !== "all" && q !== "" && (
                      <Badge variant="secondary" className="gap-1">
                        Query: {q}
                        <Link
                          href={getFilterUrl({ c: "all", p: "all", r: "all" })}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Link>
                      </Badge>
                    )}
                    {category !== "all" && category !== "" && (
                      <Badge variant="secondary" className="gap-1">
                        {category}
                        <Link
                          href={getFilterUrl({ c: "all" })}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Link>
                      </Badge>
                    )}
                    {price !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Price: {price}
                        <Link
                          href={getFilterUrl({ p: "all" })}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Link>
                      </Badge>
                    )}
                    {rating !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {rating}+ stars
                        <Link
                          href={getFilterUrl({ r: "all" })}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Link>
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/search" className="text-xs">
                        Clear all
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <div className="flex gap-1">
                  {sortOrders.map((s) => (
                    <Button
                      key={s}
                      variant={sort === s ? "default" : "outline"}
                      size="sm"
                      asChild
                      className="text-xs capitalize"
                    >
                      <Link href={getFilterUrl({ s })}>{s}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {products!.data.length > 0
                ? `Showing ${products!.data.length} product${
                    products!.data.length !== 1 ? "s" : ""
                  }`
                : "No products found"}
            </div>

            {products!.data.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/search">Clear all filters</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products!.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {products!.totalPages! > 1 && (
              <div className="flex justify-center pt-6">
                <Pagination page={page} totalPages={products!.totalPages} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${isQuerySet ? q : ""} ${
        isCategorySet ? `: Category ${category}` : ""
      } ${isPriceSet ? `: Price ${price}` : ""} ${
        isRatingSet ? `: Rating ${rating}` : ""
      }`,
    };
  } else {
    return {
      title: "Search Products",
    };
  }
}

export default SearchPage;
