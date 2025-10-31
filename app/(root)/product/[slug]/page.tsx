import { auth } from "@/auth";
import AddToCart from "@/components/shared/product/add-to-cart";
import ProductImages from "@/components/shared/product/product-images";
import ProductPrice from "@/components/shared/product/product-price";
import Rating from "@/components/shared/product/rating";
import { Badge } from "@/components/ui/badge";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ReviewList from "./review-list";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const params = await props.params;

  const { slug } = params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <ProductImages images={product.images!} />
          </div>
        </div>

        <div className="space-y-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">
              Home
            </a>
            <span>/</span>
            <a href="/" className="hover:text-gray-700">
              {product.category}
            </a>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-2">
              <Rating value={Number(product.rating)} />
              <p>{product.numReviews} reviews</p>
            </div>

            <div className="flex items-center space-x-4">
              <ProductPrice
                value={Number(product.price)}
                className="text-3xl font-bold text-gray-900"
              />
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

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Product Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex gap-x-2">
                <span className="text-gray-600">Brand:</span>
                <span className="font-medium">{product.brand}</span>
              </div>
              <div className="flex gap-x-2">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex gap-x-2">
                <span className="text-gray-600">Stock:</span>
                <span className="font-medium">{product.stock} available</span>
              </div>
              <div className="flex gap-x-2">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{product.id}</span>
              </div>
            </div>
          </div>

          {product.stock > 0 ? (
            <div className="pt-6 border-t">
              <AddToCart
                cart={cart}
                item={{
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: Number(product.price),
                  qty: 1,
                  image: product.images![0],
                }}
              />
            </div>
          ) : (
            <div className="pt-6 border-t">
              <div className="text-center py-4">
                <p className="text-red-600 font-medium mb-2">Out of Stock</p>
                <p className="text-sm text-gray-600">
                  This product is currently unavailable
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <section className="mt-10">
        <h2 className="h2-bold mb-5">Customer Reviews</h2>
        <ReviewList
          productId={product.id}
          productSlug={product.slug}
          userId={userId || ""}
        />
      </section>
    </div>
  );
};

export default ProductDetailsPage;
