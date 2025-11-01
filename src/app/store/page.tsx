"use client";

import React, { useEffect, useState } from "react";
import { useServerService } from "@/lib/services/server.service";
import { Server } from "@/lib/types/server";
import { Badge } from "@/components/ui/badge";
import ServerCard from "@/components/store/ServerCard";
import {
  Store as StoreIcon,
  Server as ServerIcon,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

// Remove ServerStatus and ServerWithStatus interfaces
// Remove fetchServerStatus and fetchServersWithStatus functions
// Remove all state and logic related to online status and player count
// Only fetch and display listed servers

export default function Store() {
  const [servers, setServers] = React.useState<Server[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  const { getServers } = useServerService();

  const fetchServers = async () => {
    try {
      const serverData = await getServers();
      const listedServers = (serverData || []).filter(
        (server: Server) => server.isListed
      );
      setServers(listedServers);
      setLoading(false);
    } catch (error) {
      setServers([]);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

  const totalServers = servers?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <StoreIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Mağaza
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Oyun sunucularımızı keşfedin ve favori eşyalarınızı satın alın
          </p>
        </div>

        {/* Servers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Oyunlar
            </h2>
            <Badge
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {totalServers} sunucu
            </Badge>
          </div>

          {!servers || totalServers === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ServerIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz sunucu bulunmuyor
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Şu anda aktif sunucu bulunmamaktadır. Lütfen daha sonra tekrar
                kontrol edin.
              </p>
            </div>
          ) : (
            // Servers Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {servers.map((server, index) => (
                <ServerCard
                  key={server.slug}
                  server={{
                    id: server.slug,
                    name: server.name,
                    image: server.image || "/images/default-category.png",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {totalServers > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Premium Eşya Koleksiyonu
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Her sunucuda özel tasarlanmış eşyalar ve avantajlı fiyatlarla oyun
              deneyiminizi geliştirin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
