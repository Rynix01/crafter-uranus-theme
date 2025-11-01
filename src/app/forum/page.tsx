"use client";

import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { AuthContext } from "@/lib/context/auth.context";
import { useWebsiteForumService } from "@/lib/services/forum.service";
import {
  ForumCategory,
  ForumTopic,
  ForumStatistics,
} from "@/lib/services/forum.service";
import { formatTimeAgo } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaPlus, FaUsers, FaFire, FaFolder } from "react-icons/fa";
import { MessageSquare, Plus, Users, TrendingUp } from "lucide-react";
import Widget from "@/components/widgets/widget";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  EmptyList,
  WidgetSkeleton,
  ForumCategoryCard,
  ForumTopicCard,
  LatestActivities,
  TopUsers,
} from "@/components/forum";

// Lazy load components
const AuthForm = dynamic(
  () =>
    import("@/components/widgets/auth-form").then((mod) => ({
      default: mod.AuthForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
    ),
  }
);

const DiscordWidget = dynamic(
  () => import("@/components/widgets/discord-widget"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
    ),
  }
);

export default function ForumPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);
  const forumService = useWebsiteForumService();

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [statistics, setStatistics] = useState<ForumStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    if (!website?.id) return;

    try {
      const [categoriesData, statsData] = await Promise.all([
        forumService.getAllCategories({ websiteId: website.id }),
        forumService.getForumStatistics({ websiteId: website.id }),
      ]);

      setCategories(categoriesData);
      setStatistics(statsData);
    } catch (err) {
      withReactContent(Swal).fire({
        title: "Hata!",
        text: "Forum verileri yüklenirken bir hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamamdır.",
      });
    } finally {
      setIsLoading(false);
      setIsStatsLoading(false);
    }
  }, [website?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Forum
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Topluluğumuzla etkileşime geçin, sorular sorun ve tartışmalara
            katılın
          </p>
          {isAuthenticated && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              asChild
            >
              <Link href="/forum/topics/new">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Konu
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Ana İçerik */}
          <div
            className={`${
              !isAuthenticated ? "lg:col-span-8" : "lg:col-span-9"
            } space-y-8`}
          >
            {/* Kategoriler */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                  <FaFolder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Kategoriler
              </h2>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {categories.map((category) => (
                    <ForumCategoryCard key={category.id} category={category} />
                  ))}
                </div>
              ) : (
                <EmptyList message="Henüz kategori bulunmuyor." />
              )}
            </div>

            {/* Son Konular */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                Son Konular
              </h2>
              {isStatsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : statistics?.lastTopics && statistics.lastTopics.length > 0 ? (
                <div className="space-y-4">
                  {statistics.lastTopics.map((topic) => (
                    <ForumTopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              ) : (
                <EmptyList message="Henüz konu bulunmuyor." />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div
            className={`${
              !isAuthenticated ? "lg:col-span-4" : "lg:col-span-3"
            } space-y-6`}
          >
            {!isAuthenticated && (
              <div className="relative z-10">
                <Suspense
                  fallback={
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                  }
                >
                  <AuthForm asWidget={true} />
                </Suspense>
              </div>
            )}

            {isStatsLoading ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                      ></div>
                    ))}
                  </div>
                </div>
              </>
            ) : statistics ? (
              <>
                {/* Son Aktiviteler Widget */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                      <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    Son Aktiviteler
                  </h3>
                  {statistics.lastTopics && statistics.lastTopics.length > 0 ? (
                    <LatestActivities statistics={statistics} />
                  ) : (
                    <EmptyList message="Henüz aktivite yok." />
                  )}
                </div>

                {/* En Aktif Kullanıcılar Widget */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    En Aktif Kullanıcılar
                  </h3>
                  {statistics.topMessageUsers &&
                  statistics.topMessageUsers.length > 0 ? (
                    <TopUsers statistics={statistics} />
                  ) : (
                    <EmptyList message="Henüz aktif kullanıcı yok." />
                  )}
                </div>
              </>
            ) : (
              <EmptyList message="İstatistikler yüklenemedi." />
            )}

            {website?.discord && (
              <div className="">
                <Suspense
                  fallback={
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                  }
                >
                  <DiscordWidget guild_id={website?.discord.guild_id ?? ""} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
