"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useWebsiteHelpCenterService,
  HelpCenterCategory,
  HelpCenterFAQ,
} from "@/lib/services/helpcenter.service";
import CubeIcon from "@/assets/icons/minecraft/CubeIcon";
import DiscordIcon from "@/assets/icons/social/DiscordIcon";
import LexicalViewer from "@/components/LexicalViewer";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function FAQAccordion({ faqs }: { faqs: HelpCenterFAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div
          key={faq.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <div
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <Badge
                variant="secondary"
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                SSS
              </Badge>
              <span className="text-gray-900 dark:text-white font-medium">
                <LexicalViewer
                  content={faq.question}
                  className="inline !mb-0 !text-base !font-medium !text-gray-900 dark:!text-white"
                />
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              tabIndex={-1}
              aria-label="Toggle"
              className="ml-2"
            >
              <span
                className={`transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </Button>
          </div>
          {openIndex === i && (
            <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4">
                <LexicalViewer
                  content={faq.answer}
                  className="!text-gray-700 dark:!text-gray-300 !text-base"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const renderIcon = (iconName: string) => {
  if (!iconName) {
    return <HelpCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  }
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent, {
      className: "w-6 h-6 text-gray-600 dark:text-gray-400",
    });
  }
  return <HelpCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
};

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<HelpCenterCategory[]>([]);
  const [faqs, setFaqs] = useState<HelpCenterFAQ[]>([]);
  const { getHelpCenter } = useWebsiteHelpCenterService();
  const router = useRouter();

  useEffect(() => {
    // Demo: API'den kategori ve SSS çek
    getHelpCenter({
      websiteId: "default",
      query: { activeOnly: true, faqOnly: true },
    }).then((data) => {
      setCategories(data.categories || []);
      setFaqs(data.faqs || []);
    });
  }, []);

  // Kategori ikonları örnek
  const icons = [
    <CubeIcon key="cube" />,
    <DiscordIcon key="discord" />,
    <span key="cart" className="text-2xl">
      🛒
    </span>,
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Yardım Merkezi
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sorunun mu var? SSS'ye göz at veya kategorilerden birini seç.
            Aradığını bulamazsan destek talebi oluşturabilirsin.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <Input
            className="w-full"
            placeholder="Sorunu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/help/${cat.id}`)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  router.push(`/help/${cat.id}`);
              }}
            >
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {renderIcon(cat.icon)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {cat.description}
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                  Kategoriyi Gör
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <FAQAccordion
            faqs={faqs.filter((faq) =>
              (faq.question.root?.children?.[0]?.text || "")
                .toLowerCase()
                .includes(search.toLowerCase())
            )}
          />
        </div>
      </div>
    </div>
  );
}
