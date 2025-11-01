"use client";

import DiscordIcon from "@/assets/icons/social/DiscordIcon";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { useServerService } from "@/lib/services/server.service";
import { Server } from "@/lib/types/server";
import { Navbar } from "./navbar";
import ServerStatusBar from "./header-components/ServerStatusBar";
import { Button } from "@/components/ui/button";
import { FaGamepad } from "react-icons/fa";
import Swal from "sweetalert2";
import Link from "next/link";

export default function Header() {
  const { website } = useContext(WebsiteContext);
  const { getServers } = useServerService();
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    players?: { online: number; max: number };
    version?: string;
    type?: string;
    ip?: string;
  } | null>(null);
  const [discordStatus, setDiscordStatus] = useState<{
    online: number;
    invite: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    async function fetchDataMinecraft() {
      try {
        const servers = await getServers();
        if (servers && servers.length > 0) {
          const selectedServer =
            servers.find((s) => s.port === 25565) || servers[0];
          const { ip, port } = selectedServer;
          const res = await fetch(
            `/api/status/minecraft?ip=${ip}&port=${port}`,
            { cache: "no-store" }
          );
          const data = await res.json();

          setServerStatus({
            online: data.online,
            players: data.players,
            version: data.version,
            type: data.type,
            ip: ip,
          });
        }
      } catch (error) {
        setServerStatus({ online: false });
      }
    }

    async function fetchDataDiscord() {
      try {
        if (!website?.discord?.guild_id) return;
        const res = await fetch(
          `/api/status/discord?guildId=${website?.discord.guild_id}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        setDiscordStatus(data);
      } catch (error) {
        setDiscordStatus(null);
      }
    }

    fetchDataMinecraft();
    fetchDataDiscord();

    const interval1 = setInterval(fetchDataMinecraft, 60_000);
    const interval2 = setInterval(fetchDataDiscord, 60_000);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        title: "Başarılı!",
        text: "IP adresi kopyalandı!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      Swal.fire({
        title: "Hata!",
        text: "Kopyalama başarısız!",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  return (
    <header className="relative">
      {/* Hero Section */}
      <div className="relative h-[300px]">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/header-bg.webp"
            alt="Header Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Logo - Center */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
          <Image
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${
              website?.image || "/images/default-logo.png"
            }`}
            alt={website?.name || "Logo"}
            width={500}
            height={125}
            className="h-32 w-auto drop-shadow-2xl"
            priority
          />
        </div>

        {/* Left Side - Server Info */}
        <div className="absolute top-1/2 left-12 transform -translate-y-1/2 z-10 hidden lg:block">
          <div
            className="flex items-center gap-4 text-white dark:text-white cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => serverStatus?.ip && copyToClipboard(serverStatus.ip)}
          >
            <div className="bg-white/90 dark:bg-gray-900/90 p-3 rounded-full shadow-lg">
              <FaGamepad className="text-3xl text-blue-600 dark:text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {serverStatus?.players?.online || 0} OYUNCU AKTİF
              </div>
              <div className="text-sm text-gray-300 dark:text-gray-300 font-medium">
                {serverStatus?.online
                  ? serverStatus?.ip || "IP ALINAMADI"
                  : "Sunucu Çevrimdışı"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Discord Info */}
        {discordStatus && (
          <div className="absolute top-1/2 right-12 transform -translate-y-1/2 text-right z-10 hidden lg:block">
            <a
              href={discordStatus.invite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-white dark:text-white justify-end cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div>
                <div className="text-xl font-bold">KATILMAK İÇİN TIKLAYIN!</div>
                <div className="text-sm text-gray-300 dark:text-gray-300 font-medium">
                  DİĞER {discordStatus.online} KİŞİ İLE TANIŞ
                </div>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 p-3 rounded-full shadow-lg">
                <DiscordIcon className="w-8 h-8" color="#2563eb" />
              </div>
            </a>
          </div>
        )}

        {/* Play Now Button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <Link href="/play">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-10 py-4 text-xl font-bold rounded-full shadow-2xl border-2 border-white/30 backdrop-blur-sm"
            >
              Şimdi Oyna
            </Button>
          </Link>
        </div>
      </div>

      <Navbar />
    </header>
  );
}
