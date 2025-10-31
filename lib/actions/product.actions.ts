"use server";
import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { ROUTES } from "../constants/routes";
import { convertToPlainObject, formatError, slugify } from "../utils";
import { insertProductSchema } from "../validator";

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  });
}

export async function getAdminProducts({
  page,
  limit = PAGE_SIZE,
  query,
}: {
  page: number;
  limit?: number;
  query?: string;
}) {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const count = await prisma.product.count({
    where: {
      ...queryFilter,
    },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(count / limit),
  };
}

export async function createProduct(formData: FormData) {
  try {
    const raw = {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      category: String(formData.get("category") || ""),
      brand: String(formData.get("brand") || ""),
      description: String(formData.get("description") || ""),
      stock: Number(formData.get("stock") || 0),
      price: String(formData.get("price") || "0"),
      images: String(formData.get("images") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as string[],
      isFeatured: String(formData.get("isFeatured") || "false") === "true",
      banner: (String(formData.get("banner") || "") || null) as string | null,
    };

    const data = insertProductSchema.parse({
      ...raw,
      slug: raw.slug ? slugify(raw.slug) : slugify(raw.name),
    });

    const created = await prisma.product.create({ data });
    revalidatePath(ROUTES.ADMIN.PRODUCTS);
    return { success: true, id: created.id };
  } catch (e) {
    return { success: false, message: formatError(e) };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const raw = {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      category: String(formData.get("category") || ""),
      brand: String(formData.get("brand") || ""),
      description: String(formData.get("description") || ""),
      stock: Number(formData.get("stock") || 0),
      price: String(formData.get("price") || "0"),
      images: String(formData.get("images") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as string[],
      isFeatured: String(formData.get("isFeatured") || "false") === "true",
      banner: (String(formData.get("banner") || "") || null) as string | null,
    };

    const data = insertProductSchema.parse({
      ...raw,
      slug: raw.slug ? slugify(raw.slug) : slugify(raw.name),
    });

    await prisma.product.update({ where: { id }, data });
    revalidatePath(ROUTES.ADMIN.PRODUCTS);
    return { success: true };
  } catch (e) {
    return { success: false, message: formatError(e) };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath(ROUTES.ADMIN.PRODUCTS);
    return { success: true, message: "Product deleted" };
  } catch (e) {
    return { success: false, message: formatError(e) };
  }
}

export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return convertToPlainObject(data);
}

export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return convertToPlainObject(data);
}

export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  category: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const categoryFilter = category && category !== "all" ? { category } : {};

  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  const ratingFilter =
    rating && rating !== "all" ? { rating: { gte: Number(rating) } } : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...ratingFilter,
      ...priceFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
        ? { price: "desc" }
        : sort === "rating"
        ? { rating: "desc" }
        : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...ratingFilter,
      ...priceFilter,
    },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}
