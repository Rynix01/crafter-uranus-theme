"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WebsiteContext } from "@/lib/context/website.context";
import {
  Instagram,
  Youtube,
  MessageCircle,
  Moon,
  Play,
  Heart,
  ExternalLink,
  Mail,
  MapPin,
  Clock,
  Users,
  Globe,
  Shield,
  Star,
  Sparkles,
  Copy,
  Check,
  Sun,
  Twitter,
  Github,
  ShoppingCart,
  HelpCircle,
  Gift,
  Gamepad2,
} from "lucide-react";
import { Server } from "@/lib/types/server";
import Link from "next/link";
import { useTheme } from "next-themes";

type Props = {
  server: Server | null;
};

const Footer = ({ server }: Props) => {
  const { website } = useContext(WebsiteContext);

  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { theme, setTheme, resolvedTheme } = useTheme();

  const copyToClipboard = async (text: string, buttonId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [buttonId]: true }));

      // 2 saniye sonra animasyonu sıfırla
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [buttonId]: false }));
      }, 2000);
    } catch (err) {}
  };

  const handleServerIPClick = () => {
    const serverIP = server?.ip || "play.hypixel.net";
    copyToClipboard(serverIP, "server-ip");
  };

  const socialMedias = [
    {
      key: "instagram",
      url: website?.social_media?.instagram,
      icon: <Instagram className="h-5 w-5" />,
      buttonClass:
        "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:border-pink-500 transition-all duration-300",
    },
    {
      key: "youtube",
      url: website?.social_media?.youtube,
      icon: <Youtube className="h-5 w-5" />,
      buttonClass:
        "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:border-red-500 transition-all duration-300",
    },
    {
      key: "discord",
      url: website?.social_media?.discord,
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
        </svg>
      ),
      buttonClass:
        "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:border-indigo-500 transition-all duration-300",
    },
    {
      key: "twitter",
      url: website?.social_media?.twitter,
      icon: <Twitter className="h-5 w-5" />,
      buttonClass:
        "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:border-blue-500 transition-all duration-300",
    },
    {
      key: "github",
      url: website?.social_media?.github,
      icon: <Github className="h-5 w-5" />,
      buttonClass:
        "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 hover:border-gray-800 transition-all duration-300",
    },
    {
      key: "tiktok",
      url: website?.social_media?.tiktok,
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      buttonClass:
        "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-cyan-500 hover:border-pink-500 transition-all duration-300",
    },
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${
                  website?.image || "/images/default-logo.png"
                }`}
                alt={website?.name || "Logo"}
                width={400}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-xs">
              {website?.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              We are not affiliated with Mojang AB or Minecraft.
            </p>
          </div>

          {/* Quick Menu */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Hızlı Menü
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Mağaza
                </Link>
              </li>
              <li>
                <Link
                  href="/redeem"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Kod Kullan
                </Link>
              </li>
              <li>
                <Link
                  href="/forum"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Forum
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Yardım
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Yasal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/rules"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Kurallar
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Hizmet Şartları
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy-policy"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Gizlilik Politikası
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Sosyal Medya
            </h4>
            <div className="flex gap-2">
              {socialMedias
                .filter((media) => media.url && media.url !== "#")
                .map((media) => (
                  <a
                    key={media.key}
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {media.icon}
                  </a>
                ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {website?.name || "Minecraft Server"}, 2025 • Tüm hakları
                saklıdır.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="https://crafter.net.tr"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-gray-500 dark:text-gray-500 text-sm">
                  Powered by
                </span>
                <Image
                  src={
                    (theme === "system" ? resolvedTheme : theme) === "dark"
                      ? "/images/crafter.png"
                      : "/images/crafter-light.png"
                  }
                  alt="Crafter"
                  width={80}
                  height={20}
                  className="h-5 w-auto"
                />
              </Link>

              <Link
                href="https://rynix.com.tr"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-gray-500 dark:text-gray-500 text-sm">
                  Themed by
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Rynix
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                {(theme === "system" ? resolvedTheme : theme) === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
