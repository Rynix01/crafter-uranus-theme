"use client";

import { Category } from "@/lib/types/category";
import { useCategoryService } from "@/lib/services/category.service";
import { useContext, useEffect, useState, use } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { useServerService } from "@/lib/services/server.service";
import { Server } from "@/lib/types/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/store/CategoryCard";
import {
  Server as ServerIcon,
  Grid3X3,
  ArrowLeft,
  Package,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NotFound from "@/components/not-found";

export default function ServerPage({
  params,
}: {
  params: Promise<{ server_id: string }>;
}) {
  // React.use() ile params'ı unwrap ediyoruz
  const { server_id } = use(params);
  const [server, setServer] = useState<Server | null>(null);
  const [serverCategories, setServerCategories] = useState<Category[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getServer } = useServerService();
  const { getCategories } = useCategoryService();
  const { website } = useContext(WebsiteContext);
  const router = useRouter();

  useEffect(() => {
    const fetchServer = async () => {
      try {
        setLoading(true);
        setError(null);

        const serverData = await getServer(server_id);
        const allCategories = await getCategories();
        const filteredCategories = allCategories.filter(
          (category) => category.server_id === serverData.id
        );

        setServerCategories(filteredCategories);
        setServer(serverData);
      } catch (error) {
        setError("Sunucu bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [server_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
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
              {Array.from({ length: 8 }).map((_, i) => (
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

  if (error || !server) {
    return (
      <NotFound
        error={error as string}
        header="Sunucu Bulunamadı"
        navigateTo="/store"
        backToText="Mağazaya Geri Dön"
      />
    );
  }

  const totalCategories = serverCategories?.length || 0;

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

        {/* Server Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-6">
              {/* Server Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                  {server.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${server.image}`}
                      alt={server.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </div>

              {/* Server Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ServerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {server.name}
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Bu sunucuya ait kategorileri keşfedin ve eşyalarınızı seçin
                </p>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    {totalCategories} Kategori
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Kategoriler
            </h2>
            {totalCategories > 0 && (
              <Badge
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {totalCategories} aktif
              </Badge>
            )}
          </div>

          {totalCategories === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid3X3 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz kategori bulunmuyor
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Bu sunucu için henüz kategori eklenmemiş. Lütfen daha sonra
                tekrar kontrol edin.
              </p>
            </div>
          ) : (
            // Categories Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {serverCategories?.map((category) => (
                <CategoryCard
                  key={category.slug}
                  category={{
                    id: category.slug,
                    name: category.name,
                    image: category.image || "/images/default-category.png",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {totalCategories > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {server.name} Özel Koleksiyonu
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Bu sunucuya özel tasarlanmış eşyalar ve kategorilerle oyun
              deneyiminizi zenginleştirin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
