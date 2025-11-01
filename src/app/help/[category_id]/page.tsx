"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useWebsiteHelpCenterService,
  HelpCenterCategory,
  HelpCenterItem,
} from "@/lib/services/helpcenter.service";
import LexicalViewer from "@/components/LexicalViewer";
import { Separator } from "@/components/ui/separator";

export default function HelpCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.category_id as string;
  const { getCategory, getHelpCenter } = useWebsiteHelpCenterService();
  const [category, setCategory] = useState<HelpCenterCategory | null>(null);
  const [items, setItems] = useState<HelpCenterItem[]>([]);
  const [selected, setSelected] = useState<HelpCenterItem | null>(null);

  // categoryId değiştiğinde seçili makaleyi sıfırla
  useEffect(() => {
    setSelected(null);
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    getCategory({ websiteId: "default", categoryId }).then(setCategory);
    getHelpCenter({
      websiteId: "default",
      query: { categoryId, activeOnly: true },
    }).then((data) => {
      setItems(data.items || []);
    });
  }, [categoryId]);

  // items değiştiğinde ilk makaleyi otomatik seç
  useEffect(() => {
    if (items.length > 0) {
      setSelected(items[0]);
    } else {
      setSelected(null);
    }
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => router.push("/help")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          aria-label="Geri Dön"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="inline-block"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Geri Dön
        </button>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {category?.name || "Yardım Merkezi"}
          </h1>
          {category?.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Makaleler
              </h2>
              <nav className="space-y-2">
                {items.length === 0 ? (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Bu kategoride makale yok.
                  </span>
                ) : (
                  items.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selected?.id === item.id
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setSelected(item)}
                    >
                      {item.title}
                    </button>
                  ))
                )}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 min-h-[400px]">
              {selected ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {selected.title}
                  </h1>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <LexicalViewer content={selected.content} />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                      📖
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Bir makale seçin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
