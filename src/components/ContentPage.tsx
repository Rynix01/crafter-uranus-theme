"use client";

import { useContext, useEffect, useState } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { useLegalService } from "@/lib/services/legal.service";
import LexicalViewer from "@/components/LexicalViewer";
import { AlertCircle, FileText } from "lucide-react";

interface ContentPageProps {
  title: string;
  documentType: "rules" | "privacy_policy" | "terms_of_service";
  description?: string;
  icon?: React.ReactNode;
}

export default function ContentPage({
  title,
  documentType,
  description,
  icon = <FileText className="h-5 w-5" />,
}: ContentPageProps) {
  const { website } = useContext(WebsiteContext);
  const { getLegalDocuments } = useLegalService();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!website?.id) return;

      try {
        setLoading(true);
        setError(null);
        const documents = await getLegalDocuments();
        const documentContent = documents[documentType];

        if (documentContent) {
          setContent(documentContent);
        } else {
          setError("Bu sayfa henüz oluşturulmamış.");
        }
      } catch (err) {
        console.error("İçerik yüklenirken hata oluştu:", err);
        setError(
          "İçerik yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [website?.id, documentType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-6">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto"></div>
              {description && (
                <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto"></div>
              )}
            </div>

            {/* Content Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="space-y-4">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {description}
              </p>
            )}

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200 font-medium">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                {icon}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <LexicalViewer
                content={content}
                className="text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
