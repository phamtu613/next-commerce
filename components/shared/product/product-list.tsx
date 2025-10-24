import { Product } from "@/types";
import ProductCard from "./product-card";

const ProductList = ({ data, title }: { data: Product[]; title?: string }) => {
  return (
    <div className="space-y-8">
      {title && <h2 className="h2-bold">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((product: Product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
