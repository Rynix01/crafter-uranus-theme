"use client";

import { Category } from "@/lib/types/category";
import { useCategoryService } from "@/lib/services/category.service";
import { use, useContext, useEffect, useState } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { useProductService } from "@/lib/services/product.service";
import { Product } from "@/lib/types/product";
import ProductCard from "@/components/store/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package2,
  Grid3X3,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NotFound from "@/components/not-found";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category_id: string }>;
}) {
  const { category_id } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getCategory } = useCategoryService();
  const { getProductsByCategory } = useProductService();
  const { website } = useContext(WebsiteContext);
  const router = useRouter();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryData = await getCategory(category_id);
        const productsData = await getProductsByCategory(categoryData.id);

        setCategory(categoryData);
        setProducts(productsData);
      } catch (error) {
        setError("Kategori bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [category_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse"></div>
          </div>
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg h-48 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <NotFound
        error={error as string}
        header="Kategori Bulunamadı"
        navigateTo="/store"
        backToText="Mağazaya Geri Dön"
      />
    );
  }

  const totalProducts = products?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/store")}
            className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mağazaya Dön
          </Button>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-6">
              {/* Category Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </div>

              {/* Category Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Bu kategorideki özel ürünleri keşfedin ve favori eşyalarınızı
                  bulun
                </p>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    {totalProducts} Ürün
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Package2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ürünler
            </h2>
            {totalProducts > 0 && (
              <Badge
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {totalProducts} mevcut
              </Badge>
            )}
          </div>

          {totalProducts === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz ürün bulunmuyor
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Bu kategori için henüz ürün eklenmemiş. Lütfen daha sonra tekrar
                kontrol edin.
              </p>
            </div>
          ) : (
            // Products Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.slug} item={product} />
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {totalProducts > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name} Özel Koleksiyonu
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Bu kategoriye özel seçilmiş kaliteli ürünlerle oyun deneyiminizi
              bir üst seviyeye taşıyın
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
