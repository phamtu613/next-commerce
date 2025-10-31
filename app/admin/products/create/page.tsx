import { Metadata } from "next";
import ProductForm from "../product-form";

export const metadata: Metadata = {
  title: "Create Product",
};

export default function CreateProductPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="h2-bold">Create Product</h2>
      <ProductForm />
    </div>
  );
}
