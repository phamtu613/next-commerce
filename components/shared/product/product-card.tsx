import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import Rating from "./rating";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.brand}
            </Badge>
            <Rating value={Number(product.rating)} />
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.stock > 0 && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                In Stock
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
