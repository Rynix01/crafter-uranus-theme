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
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import Widget from "@/components/widgets/widget";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  EmptyList,
  WidgetSkeleton,
  CreateTopicForm,
  UserProfileCard,
  TopicView,
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

export default function TopicPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);
  const forumService = useWebsiteForumService();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [topicCategory, setTopicCategory] = useState<ForumCategory | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const topicSlug = params.topic_slug as string;
  const categoryId = searchParams.get("categoryId");

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    if (!website?.id) return;

    try {
      // Eğer categoryId varsa, yeni konu oluşturma modu
      if (categoryId) {
        const categoryData = await forumService.getCategoryById({
          websiteId: website.id,
          categoryIdOrSlug: categoryId,
        });
        setCategory(categoryData);
        setIsCreateMode(true);
      } else {
        // Topic slug ile topic'i getir
        const topicData = await forumService.getTopicById({
          websiteId: website.id,
          topicIdOrSlug: topicSlug,
        });
        setTopic(topicData);

        // Topic'in kategorisini de getir
        if (topicData.categoryId) {
          try {
            const categoryData = await forumService.getCategoryById({
              websiteId: website.id,
              categoryIdOrSlug: topicData.categoryId,
            });
            setTopicCategory(categoryData);
          } catch (err) {
            console.log("Kategori bilgisi alınamadı");
          }
        }

        setIsCreateMode(false);
      }
    } catch (err) {
      withReactContent(Swal).fire({
        title: "Hata!",
        text: "Veriler yüklenirken bir hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamamdır.",
      });
      router.push("/forum");
    } finally {
      setIsLoading(false);
    }
  }, [website?.id, topicSlug, categoryId, router]);

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
                <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white w-fit"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Geri</span>
            </Button>

            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Link
                href="/forum"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Forum
              </Link>
              <span className="text-gray-400">/</span>
              {isCreateMode && category ? (
                <>
                  <Link
                    href={`/forum/category/${category.slug}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                    title={category.name}
                  >
                    {category.name}
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px] sm:max-w-none">
                    Yeni Konu
                  </span>
                </>
              ) : topic ? (
                <>
                  <Link
                    href={`/forum/category/${topic.categoryId}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Kategori
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span
                    className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-[300px] md:max-w-none"
                    title={topic.title}
                  >
                    {topic.title}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* Page Title */}
          {isCreateMode && category ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Yeni Konu Oluştur
                </h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {category.name} kategorisinde yeni bir konu başlatın
              </p>
            </div>
          ) : topic ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {topic.title}
                </h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {topicCategory?.name} kategorisinde bir konu
              </p>
            </div>
          ) : null}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Ana İçerik */}
          <div
            className={`${
              !isAuthenticated ? "lg:col-span-8" : "lg:col-span-9"
            } space-y-8`}
          >
            {isCreateMode && category ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <CreateTopicForm category={category} />
              </div>
            ) : topic ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <TopicView topic={topic} topicCategory={topicCategory} />
              </div>
            ) : (
              <EmptyList message="Konu bulunamadı." />
            )}
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

            {/* Topic Yazarı Profil Kartı */}
            {topic && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Konu Yazarı
                </h3>
                <UserProfileCard
                  username={topic.authorName}
                  createdAt={topic.createdAt}
                  isAuthor={true}
                />
              </div>
            )}

            {/* Son Mesaj Yazanlar */}
            {topic && topic.messages.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <FaUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Son Mesaj Yazanlar
                </h3>
                <div className="space-y-3">
                  {topic.messages
                    .slice(-3)
                    .reverse()
                    .map((message) => (
                      <UserProfileCard
                        key={message.id}
                        username={message.authorName}
                        createdAt={message.createdAt}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Discord Widget */}
            {website?.discord && (
              <div className="w-full">
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
