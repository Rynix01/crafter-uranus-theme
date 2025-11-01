"use client";

import { useContext } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Settings, LogIn, MessageSquare } from "lucide-react";

export default function Maintenance() {
  const { website } = useContext(WebsiteContext);
  const { theme, resolvedTheme } = useTheme();

  // Eğer website yüklenmemişse loading göster
  if (!website) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[length:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Logo with Animation */}
        <div className="mb-8">
          <Image
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${
              website?.image || "/images/crafter.png"
            }`}
            alt={website?.name || "Site Logo"}
            width={192}
            height={192}
            className="mx-auto animate-bounce"
            priority
          />
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Settings className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Bakım Modu
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
          Sitemiz şu anda bakımda. Daha iyi bir deneyim için çalışıyoruz.
        </p>

        {/* Admin Login Button - Only show when maintenance is active */}
        {website?.maintenance && (
          <div className="mt-6">
            <a
              href="/auth/sign-in"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Erişiminiz var ise giriş yapın
            </a>
          </div>
        )}

        {/* Discord Button */}
        {website?.discord && (
          <div className="mt-8">
            <a
              href="https://discord.gg/your-server"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 group"
            >
              <MessageSquare className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Discord Sunucumuza Katıl
            </a>
          </div>
        )}
      </div>

      {/* Powered by Logo - Fixed at bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <a
          href="https://crafter.net.tr"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Powered by
          </span>
          <Image
            src={
              (theme === "system" ? resolvedTheme : theme) === "dark"
                ? "/images/crafter.png"
                : "/images/crafter-light.png"
            }
            alt="Crafter"
            width={200}
            height={200}
            className="h-8 w-auto"
          />
        </a>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-500/10 rounded-full animate-pulse delay-500"></div>
    </div>
  );
}
