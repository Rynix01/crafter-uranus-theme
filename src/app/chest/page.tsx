"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { Package, PackageOpen, Sparkles } from "lucide-react";

import ChestItemCard from "@/components/chest/ChestItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/lib/context/auth.context";
import { useChestService } from "@/lib/services/chest.service";
import { ChestItem } from "@/lib/types/chest";

export default function ChestPage() {
  const router = useRouter();
  const {
    user,
    isLoading: userIsLoading,
    isAuthenticated,
  } = useContext(AuthContext);
  const { getChestItems } = useChestService();

  const [chest, setChest] = useState<ChestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChestData = async () => {
      if (!user?.id) return;

      try {
        const items = await getChestItems(user.id);
        setChest(items);
        setError(null);
      } catch (err) {
        setError(
          "Eşyalar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userIsLoading) {
      setIsLoading(true);
      return;
    }

    if (!isLoading && user === undefined) {
      router.push("/");
      return;
    }

    fetchChestData();
  }, [user, userIsLoading, isAuthenticated, router]);

  const totalItems = chest?.length || 0;
  const usedItems = chest?.filter((item) => item.used).length || 0;
  const availableItems = totalItems - usedItems;

  if (isLoading || userIsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Sandığınız yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-6xl mb-4">❌</div>
          <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Sandığım
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Sahip olduğunuz eşyaları görüntüleyin ve yönetin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Toplam Eşya
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalItems}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Kullanılabilir
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {availableItems}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Kullanılmış
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {usedItems}
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <PackageOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Eşyalarım
            </h2>
            {totalItems > 0 && (
              <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {totalItems} eşya
              </Badge>
            )}
          </div>

          {totalItems === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                📦
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Sandığınız boş
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Henüz hiç eşyanız yok. Mağazadan eşya satın alarak sandığınızı
                doldurmaya başlayın!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {chest.map((item) => (
                <ChestItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Eşyalarınızı kullanarak çeşitli avantajlar elde edebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
