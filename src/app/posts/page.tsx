"use client";
import { useState, useEffect } from "react";
import PostList from "@/components/posts/PostList";
import { useWebsiteContext } from "@/lib/context/website.context";
import { useWebsitePostsService } from "@/lib/services/posts.service";
import { FileText } from "lucide-react";

const PAGE_SIZE = 6;

const PostsPage = () => {
  const { website } = useWebsiteContext();
  const { getPosts } = useWebsitePostsService(website?.id);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!website?.id) return;
    setLoading(true);
    getPosts({
      websiteId: website.id,
      params: { page: currentPage, limit: PAGE_SIZE },
    })
      .then((res) => {
        setPosts(res.data);
        setTotalPages(res.pagination.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [currentPage, website?.id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Tüm Yazılar
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            En son haberler ve duyuruları buradan takip edebilirsiniz
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              Yükleniyor...
            </p>
          </div>
        ) : (
          <PostList
            posts={posts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default PostsPage;
