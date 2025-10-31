import { prisma } from "@/db/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "../product-form";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = await prisma.product.findFirst({ where: { id } });
  if (!product) notFound();

  const editable = {
    name: product.name,
    slug: product.slug,
    category: product.category,
    brand: product.brand,
    description: product.description,
    stock: product.stock,
    price: product.price.toString(),
    images: product.images,
    isFeatured: product.isFeatured,
    banner: product.banner,
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="h2-bold">Edit Product</h2>
      <ProductForm product={editable} id={id} />
    </div>
  );
}
