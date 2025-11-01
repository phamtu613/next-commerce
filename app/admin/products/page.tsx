import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct, getAdminProducts } from "@/lib/actions/product.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
export const dynamic = "force-dynamic"; // Next.js 13+ App Router

export const metadata: Metadata = {
  title: "Admin Products",
};

const ProductsPage = async (props: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) => {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const { page = "1", query: searchText } = searchParams;

  const products = await getAdminProducts({
    page: Number(page) || 1,
    query: searchText,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="h2-bold">Products</h2>
          {searchText && (
            <div>
              Filtered by <i>&quot;{searchText}&quot;</i>{" "}
              <Link href={ROUTES.ADMIN.PRODUCTS}>
                <Button variant="outline" size="sm">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Button asChild>
          <Link href={ROUTES.ADMIN.PRODUCT_CREATE}>Create Product</Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>PRICE</TableHead>
              <TableHead>STOCK</TableHead>
              <TableHead>UPDATED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.data.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{formatId(p.id)}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{formatCurrency(p.price)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{formatDateTime(p.createdAt).dateTime}</TableCell>
                <TableCell className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={ROUTES.ADMIN.PRODUCT_BY_ID(p.id)}>Edit</Link>
                  </Button>
                  <DeleteDialog id={p.id} action={deleteProduct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {products.totalPages > 1 && (
        <Pagination page={Number(page) || 1} totalPages={products.totalPages} />
      )}
    </div>
  );
};

export default ProductsPage;
