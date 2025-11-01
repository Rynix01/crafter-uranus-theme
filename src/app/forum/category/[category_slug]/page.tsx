"use client";

import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  Suspense,
} from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { AuthContext } from "@/lib/context/auth.context";
import { useWebsiteForumService } from "@/lib/services/forum.service";
import { ForumCategory, ForumTopic } from "@/lib/services/forum.service";
import { formatTimeAgo } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  FaComments,
  FaEye,
  FaThumbtack,
  FaLock,
  FaPlus,
  FaArrowLeft,
  FaClock,
  FaUser,
  FaUsers,
  FaFolder,
  FaSearch,
  FaSort,
} from "react-icons/fa";
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  FolderOpen,
  Search,
  ArrowUpDown,
} from "lucide-react";
import Widget from "@/components/widgets/widget";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  EmptyList,
  WidgetSkeleton,
  ForumTopicCard,
  SubCategories,
  CategoryStats,
  renderIcon,
  ForumCategoryCard,
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

export default function CategoryPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);
  const forumService = useWebsiteForumService();
  const params = useParams();
  const router = useRouter();

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);

  const categorySlug = params.category_slug as string;

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    if (!website?.id || !categorySlug) return;

    try {
      // Slug ile kategori bulma - id yerine slug gönderiyoruz
      const categoryData = await forumService.getCategoryById({
        websiteId: website.id,
        categoryIdOrSlug: categorySlug,
      });

      setCategory(categoryData);

      // Kategori konularını getir
      const topicsData = await forumService.getTopicsByCategoryId({
        websiteId: website.id,
        categoryIdOrSlug: categorySlug,
      });

      setTopics(topicsData);
    } catch (err) {
      withReactContent(Swal).fire({
        title: "Hata!",
        text: "Kategori verileri yüklenirken bir hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamamdır.",
      });
      // Hata durumunda forum ana sayfasına yönlendir
      router.push("/forum");
    } finally {
      setIsLoading(false);
      setIsTopicsLoading(false);
    }
  }, [website?.id, categorySlug, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <EmptyList message="Kategori bulunamadı." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Button>
                <Link
                  href="/forum"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                >
                  Forum
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {category.name}
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h1>
                </div>
                {category.description && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                    {category.description}
                  </p>
                )}
                {isAuthenticated && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                    asChild
                  >
                    <Link href={`/forum/topics/new?categoryId=${category.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Konu
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Ana İçerik */}
          <div
            className={`${
              !isAuthenticated ? "lg:col-span-8" : "lg:col-span-9"
            } space-y-8`}
          >
            {/* Alt Kategoriler */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Alt Kategoriler
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {category.subCategories.map((subCategory) => (
                    <ForumCategoryCard
                      key={subCategory.id}
                      category={subCategory}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Konular */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Konular
                </h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Ara
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Sırala
                  </Button>
                </div>
              </div>

              {isTopicsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : topics.length > 0 ? (
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <ForumTopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              ) : (
                <EmptyList message="Bu kategoride henüz konu bulunmuyor." />
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

            {/* Kategori İstatistikleri */}
            <CategoryStats category={category} />

            {/* Alt Kategoriler */}
            <SubCategories subCategories={category.subCategories} />

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
