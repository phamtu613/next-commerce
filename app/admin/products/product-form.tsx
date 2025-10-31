"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { ROUTES } from "@/lib/constants/routes";
import { insertProductSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function ProductForm({
  product,
  id,
}: {
  product?: z.infer<typeof insertProductSchema>;
  id?: string;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: product ?? {
      name: "",
      slug: "",
      category: "",
      brand: "",
      description: "",
      stock: 0,
      price: "0",
      images: [],
      isFeatured: false,
      banner: null,
    },
  });

  async function onSubmit(values: z.infer<typeof insertProductSchema>) {
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("slug", values.slug ?? "");
    fd.set("category", values.category);
    fd.set("brand", values.brand);
    fd.set("description", values.description);
    fd.set("stock", String(values.stock));
    fd.set("price", String(values.price));
    fd.set("images", values.images.join(","));
    fd.set("isFeatured", String(values.isFeatured));
    if (values.banner) fd.set("banner", values.banner);

    const res = id ? await updateProduct(id, fd) : await createProduct(fd);
    if (!res.success) return alert(res.message || "Failed");
    router.push(ROUTES.ADMIN.PRODUCTS);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <Input
            value={form.watch("name")}
            onChange={(e) => form.setValue("name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <Input
            value={form.watch("slug") || ""}
            onChange={(e) => form.setValue("slug", e.target.value)}
            placeholder="optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <Input
            value={form.watch("category")}
            onChange={(e) => form.setValue("category", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Brand</label>
          <Input
            value={form.watch("brand")}
            onChange={(e) => form.setValue("brand", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <Input
            value={String(form.watch("price") ?? "")}
            onChange={(e) => form.setValue("price", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Stock</label>
          <Input
            type="number"
            value={Number(form.watch("stock"))}
            onChange={(e) => form.setValue("stock", Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <Textarea
          value={form.watch("description")}
          onChange={(e) => form.setValue("description", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Images (comma separated URLs)
        </label>
        <Input
          value={form.watch("images").join(",")}
          onChange={(e) =>
            form.setValue(
              "images",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Featured</label>
          <Input
            type="checkbox"
            checked={form.watch("isFeatured")}
            onChange={(e) => form.setValue("isFeatured", e.target.checked)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Banner (URL)</label>
          <Input
            value={form.watch("banner") ?? ""}
            onChange={(e) => form.setValue("banner", e.target.value || null)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">{id ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
