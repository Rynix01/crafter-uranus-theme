"use client";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthContext } from "@/lib/context/auth.context";
import { WebsiteContext } from "@/lib/context/website.context";
import { useWebsitePostsService } from "@/lib/services/posts.service";
import LexicalViewer from "@/components/LexicalViewer";
import { Button } from "@/components/ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { translatePostType } from "@/lib/utils";
import { ArrowLeft, Heart, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const post_slug = Array.isArray(params.post_slug)
    ? params.post_slug[0]
    : params.post_slug;
  const { website } = useContext(WebsiteContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { getPost, likePost, unlikePost } = useWebsitePostsService(website?.id);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (!website?.id || !post_slug) return;
      setLoading(true);
      try {
        const data = await getPost({
          websiteId: website.id,
          postId: post_slug,
        });
        setPost(data);
        setLiked(!!(user && data.likedBy && data.likedBy.includes(user.id)));
        setLikeCount(data.likeCount || 0);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [website?.id, post_slug, user]);

  const handleLike = async () => {
    if (!isAuthenticated || !post || !website) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikePost({ websiteId: website.id, postId: post.id });
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await likePost({ websiteId: website.id, postId: post.id });
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              Yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              📰
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Gönderi bulunamadı
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Aradığınız gönderi mevcut değil veya kaldırılmış olabilir.
            </p>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tüm Yazılara Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let lexicalContent = {};
  try {
    lexicalContent =
      typeof post.content === "string"
        ? JSON.parse(post.content)
        : post.content;
  } catch {
    lexicalContent = {};
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tüm Yazılara Dön
          </Link>
        </div>

        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-64 md:h-80">
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.featuredImage}`}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              {/* Post Type and Date */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="font-medium">
                    {translatePostType(post.type)}
                  </span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {new Date(post.publishedAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {post.title}
              </h1>

              {/* Author and Like */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Yazar: {post.authorName}</span>
                </div>

                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  disabled={!isAuthenticated || likeLoading}
                  className={
                    liked ? "bg-red-500 hover:bg-red-600 text-white" : ""
                  }
                >
                  {liked ? (
                    <FaHeart className="mr-1" />
                  ) : (
                    <FaRegHeart className="mr-1" />
                  )}
                  {likeCount}
                </Button>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <LexicalViewer content={lexicalContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
