"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/lib/context/auth.context";
import { useRouter } from "next/navigation";
import { useWebsiteTicketService } from "@/lib/services/ticket.service";
import TicketList from "@/components/support/TicketList";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

export default function SupportPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();
  const { getTickets } = useWebsiteTicketService();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/sign-in?return=/support");
      return;
    }
    getTickets()
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCreate = () => {
    if (!isAuthenticated) {
      router.push("/auth/sign-in?return=/support/create");
    } else {
      router.push("/support/create");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Destek Taleplerim
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Destek taleplerinizi görüntüleyin ve yönetin
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Destek Talebi Oluştur
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          ) : (
            <TicketList tickets={tickets} />
          )}
        </div>
      </div>
    </div>
  );
}
