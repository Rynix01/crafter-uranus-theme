"use client";

import { useState, useEffect } from "react";
import { useServerService } from "@/lib/services/server.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Server,
  Users,
  Wifi,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function PlayPage() {
  const { getServers } = useServerService();
  const [servers, setServers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<{
    ip: string;
    port: string;
    online: boolean;
    players: number;
    maxPlayers: number;
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
            ip: ip,
            port: String(port),
            online: data.online || false,
            players: data.players?.online || 0,
            maxPlayers: data.players?.max || 100,
          });
        }
      } catch (error) {
        console.error("Sunucu bilgileri alınamadı:", error);
        setServerStatus({
          ip: "play.example.com",
          port: "25565",
          online: false,
          players: 0,
          maxPlayers: 100,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataMinecraft();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        icon: "success",
        title: "Kopyalandı!",
        text: "IP adresi panoya kopyalandı",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: "IP adresi kopyalanamadı",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  const fullAddress = serverStatus
    ? `${serverStatus.ip}:${serverStatus.port}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sunucuya Katıl
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Minecraft sunucumuza nasıl katılacağınızı öğrenin
          </p>
        </div>

        {/* Server Info Card */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Sunucu Bilgileri
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              </div>
            ) : serverStatus ? (
              <div className="space-y-4">
                {/* Server Address */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Sunucu Adresi
                      </h3>
                      <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                        {fullAddress}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(fullAddress)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Kopyala
                    </Button>
                  </div>
                </div>

                {/* Server Status */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {serverStatus.online ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {serverStatus.online ? "Çevrimiçi" : "Çevrimdışı"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {serverStatus.players}/{serverStatus.maxPlayers} oyuncu
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Sunucu bilgileri yüklenemedi.
              </p>
            )}
          </div>
        </Card>

        {/* How to Join Instructions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Step 1 */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Minecraft'ı Açın
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Minecraft Java Edition'ı açın ve "Çok Oyunculu" sekmesine gidin.
              </p>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    2
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sunucu Ekle
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                "Sunucu Ekle" butonuna tıklayın ve sunucu adresini girin.
              </p>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bağlan
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Sunucu listesinde sunucumuzu seçin ve "Sunucuya Katıl" butonuna
                tıklayın.
              </p>
            </div>
          </Card>

          {/* Step 4 */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    4
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Oynamaya Başla
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Artık sunucumuzda oynayabilir ve diğer oyuncularla
                tanışabilirsiniz!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
