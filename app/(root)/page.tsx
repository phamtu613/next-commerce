import Header from "@/components/shared/header";
import { ProductCarousel } from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductsButton from "@/components/shared/view-all-products-button";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
export const dynamic = "force-dynamic"
const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Header />
      <div className="wrapper space-y-8">
        {featuredProducts.length > 0 && (
          <ProductCarousel data={featuredProducts} />
        )}
        <ProductList title="Latest Products" data={latestProducts} />
        <ViewAllProductsButton />
      </div>
    </>
  );
};

export default HomePage;
