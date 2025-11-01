import LatestPostCard from "../LatestPostCard";
import Pagination from "./Pagination";

interface PostListProps {
  posts: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const PostList = ({
  posts,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  emptyMessage = "Henüz gönderi yok.",
}: PostListProps) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
          Yükleniyor...
        </p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📰</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Henüz gönderi yok
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const sortedPosts = [...posts].sort(
    (a, b) =>
      (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) ||
      new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
  );

  return (
    <div className="space-y-8">
      {sortedPosts.map((post) => (
        <LatestPostCard key={post.id || post.slug} post={post} />
      ))}
      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default PostList;
