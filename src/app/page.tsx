"use client";

import { AuthContext } from "@/lib/context/auth.context";
import {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { useServerService } from "@/lib/services/server.service";
import { useStatisticsService } from "@/lib/services/statistics.service";
import { IPublicWebsiteStatistics } from "@/lib/types/statistics";
import { Server } from "@/lib/types/server";
import { formatTimeAgo } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useWebsitePostsService } from "@/lib/services/posts.service";
import LatestPostCard from "@/components/LatestPostCard";
import InnovativeSignups from "@/components/widgets/InnovativeSignups";

// Lazy load heavy components
const InnovativeCarousel = dynamic(
  () =>
    import("@/components/ui/innovative-carousel").then((mod) => ({
      default: mod.InnovativeCarousel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
    ),
  }
);

const SlideContent = dynamic(
  () =>
    import("@/components/ui/innovative-carousel").then((mod) => ({
      default: mod.SlideContent,
    })),
  { ssr: false }
);

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

// UI ve Widget Component'leri
import Widget from "@/components/widgets/widget";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FaShoppingCart, FaCrown, FaGift, FaUserPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Badge } from "@/components/ui/badge";

// Boş liste durumunda gösterilecek component
const EmptyList = ({ message }: { message: string }) => (
  <p className="text-center text-xs text-gray-500 dark:text-gray-400 p-4">
    {message}
  </p>
);

// Yükleniyor durumunda gösterilecek widget iskeleti
const WidgetSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <Widget>
    <Widget.Header>
      <Skeleton className="h-5 w-3/5" />
    </Widget.Header>
    <Widget.Body>
      <div className="space-y-3 p-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </Widget.Body>
  </Widget>
);

// Memoized statistics components
const TopCreditLoaders = ({ loaders }: { loaders: any[] }) => (
  <div className="space-y-3">
    {loaders.map((loader, index) => (
      <div
        key={loader.id}
        className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
          {index + 1}
        </span>
        <Avatar username={loader.username} size={32} className="mx-3" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {loader.username}
          </p>
        </div>
        <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
          {loader.totalAmount.toFixed(2)} ₺
        </span>
      </div>
    ))}
  </div>
);

const LatestPayments = ({ payments }: { payments: any[] }) => (
  <div className="space-y-3">
    {payments.map((payment) => (
      <div
        key={payment.id}
        className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Avatar username={payment.username} size={32} className="mr-3" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {payment.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(payment.timestamp)}
          </p>
        </div>
        <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
          {payment.amount.toFixed(2)} ₺
        </span>
      </div>
    ))}
  </div>
);

const LatestPurchases = ({ purchases }: { purchases: any[] }) => (
  <div className="space-y-3">
    {purchases.map((purchase) => (
      <div
        key={purchase.id}
        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center mb-2">
          <Avatar username={purchase.username} size={32} className="mr-3" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {purchase.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(purchase.timestamp)}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
            {purchase.productName}
          </Badge>{" "}
          ürününü satın aldı!
        </div>
      </div>
    ))}
  </div>
);

const LatestSignups = ({ signups }: { signups: any[] }) => (
  <ul className="space-y-1">
    {signups.map((signup) => (
      <li
        key={signup.id}
        className="flex items-center p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-gray-700/40"
      >
        <Avatar username={signup.username} size={32} className="mr-3" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {signup.username}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Aramıza katıldı
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {formatTimeAgo(signup.timestamp)}
        </span>
      </li>
    ))}
  </ul>
);

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);
  const { getServers } = useServerService();
  const { getStatistics } = useStatisticsService();
  const { getPosts } = useWebsitePostsService(website?.id);
  const [server, setServer] = useState<Server | null>(null);
  const [statistics, setStatistics] = useState<IPublicWebsiteStatistics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [latestPosts, setLatestPosts] = useState<any[] | null>(null);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  // Memoized carousel items
  const carouselItems = useMemo(
    () =>
      website?.sliders?.map((slider) => ({
        id: slider.id,
        content: (
          <SlideContent
            image={`${process.env.NEXT_PUBLIC_BACKEND_URL}${slider.image}`}
            title={slider.text}
            description={slider.description}
            buttonText={slider.buttonText}
            buttonLink={slider.route}
          />
        ),
      })) || [],
    [website?.sliders]
  );

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    try {
      const [servers, stats] = await Promise.all([
        getServers(),
        getStatistics(),
      ]);

      setServer(servers.find((server) => server.port === 25565) || servers[0]);
      setStatistics(stats);
    } catch (err) {
      withReactContent(Swal).fire({
        title: "Hata!",
        text: "İstatistikler yüklenirken bir hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamamdır.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Son gönderileri çek
    const fetchPosts = async () => {
      if (!website?.id) return; // id yoksa fetch etme
      try {
        const res = await getPosts({
          websiteId: website.id,
          params: {
            limit: 5,
            sortBy: "createdAt",
            sortOrder: "desc",
            status: "published",
          },
        });

        setLatestPosts(res.data);
      } catch {
        setLatestPosts([]);
      } finally {
        setIsPostsLoading(false);
      }
    };
    fetchPosts();
  }, [website?.id]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Banner Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {website?.name || "Minecraft Server"}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {website?.description ||
                "En iyi Minecraft deneyimi için bize katıl!"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column - Main Content */}
          <div
            className={`${
              !isAuthenticated ? "lg:col-span-8" : "lg:col-span-9"
            } space-y-6 order-2 lg:order-1`}
          >
            {/* Carousel */}
            {carouselItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Suspense
                  fallback={
                    <div className="h-[300px] bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  }
                >
                  <InnovativeCarousel
                    items={carouselItems}
                    autoplay={true}
                    autoplayDelay={5000}
                    showProgress={true}
                    height="h-[300px]"
                  />
                </Suspense>
              </div>
            )}

            {/* Latest Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Son Haberler
                </h2>
              </div>
              <div className="p-6">
                {isPostsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : latestPosts && latestPosts.length > 0 ? (
                  <div className="space-y-4">
                    {[...latestPosts]
                      .sort(
                        (a, b) =>
                          (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) ||
                          new Date(b.publishedAt || b.createdAt).getTime() -
                            new Date(a.publishedAt || a.createdAt).getTime()
                      )
                      .map((post) => (
                        <LatestPostCard key={post.id} post={post} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Henüz gönderi yok.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div
            className={`${
              !isAuthenticated ? "lg:col-span-4" : "lg:col-span-3"
            } space-y-6 order-1 lg:order-2`}
          >
            {/* Auth Form */}
            {!isAuthenticated && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Giriş Yap
                  </h3>
                </div>
                <div className="p-6">
                  <Suspense
                    fallback={
                      <div className="h-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
                    }
                  >
                    <AuthForm asWidget={true} />
                  </Suspense>
                </div>
              </div>
            )}

            {/* Statistics Widgets */}
            {isLoading ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : statistics ? (
              <div className="space-y-6">
                {/* Top Credit Loaders */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <FaCrown className="mr-2 text-yellow-500" />
                      En Cömertler
                    </h3>
                  </div>
                  <div className="p-6">
                    {statistics.topCreditLoaders &&
                    statistics.topCreditLoaders.length > 0 ? (
                      <TopCreditLoaders loaders={statistics.topCreditLoaders} />
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Henüz kimse kredi yüklemedi.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Latest Payments */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <FaGift className="mr-2 text-green-500" />
                      Son Kredi Yüklemeleri
                    </h3>
                  </div>
                  <div className="p-6">
                    {statistics.latest.payments &&
                    statistics.latest.payments.length > 0 ? (
                      <LatestPayments payments={statistics.latest.payments} />
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Son zamanlarda kredi yüklenmedi.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Latest Purchases */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <FaShoppingCart className="mr-2 text-blue-500" />
                      Son Alışverişler
                    </h3>
                  </div>
                  <div className="p-6">
                    {statistics.latest.purchases &&
                    statistics.latest.purchases.length > 0 ? (
                      <LatestPurchases
                        purchases={statistics.latest.purchases}
                      />
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Son zamanlarda alışveriş yapılmadı.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    İstatistikler yüklenemedi.
                  </p>
                </div>
              </div>
            )}

            {/* Discord Widget */}
            {website?.discord && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Discord Topluluğu
                  </h3>
                </div>
                <div className="p-6">
                  <Suspense
                    fallback={
                      <div className="h-48 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
                    }
                  >
                    <DiscordWidget guild_id={website?.discord.guild_id ?? ""} />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
