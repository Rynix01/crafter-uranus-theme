"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useVoteService } from "@/lib/services/vote.service";
import { VoteProvider } from "@/lib/types/vote";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/context/auth.context";
import { FaVoteYea, FaCheckCircle, FaExclamationCircle, FaClock, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const AuthForm = dynamic(() => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function VoteProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.provider_id as string;
  const { sendVote, getProvider } = useVoteService();
  const { isAuthenticated, isLoading, user } = React.useContext(AuthContext);
  const [provider, setProvider] = useState<VoteProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Kullanıcının oy kullanabilir durumunu kontrol et
  const canVote = () => {
    if (!user?.nextVoteAt) return true;
    return new Date() > new Date(user.nextVoteAt);
  };

  // Kalan süreyi hesapla
  const getTimeUntilNextVote = () => {
    if (!user?.nextVoteAt) return null;
    const nextVoteDate = new Date(user.nextVoteAt);
    const now = new Date();
    const diff = nextVoteDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in?return=/vote");
      return;
    }
    if (!isAuthenticated) return;

    setLoading(true);
    getProvider(providerId)
      .then((data) => {
        if (!data.isActive) {
          setError("Bu vote provider aktif değil.");
          return;
        }
        setProvider(data);
      })
      .catch(() => setError("Vote provider bulunamadı."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router, providerId]);

  const handleVote = async () => {
    if (!canVote()) {
      setError("Henüz oy veremezsiniz. Lütfen bekleyin.");
      return;
    }

    setVoting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendVote(providerId);
      if (result.status) {
        setSuccess(result.message);
        // Sayfayı yenile ki kullanıcının nextVoteAt bilgisi güncellensin
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Oy gönderilirken bir hata oluştu.");
    } finally {
      setVoting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-16 px-6 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="p-4 rounded-full bg-blue-500/20 w-fit mx-auto mb-4">
              <FaVoteYea className="text-6xl text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Oy Ver
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
              Sunucumuza oy vererek bize destek olabilirsiniz. Giriş yapın ve oy vermeye başlayın!
            </p>
          </motion.div>
          <Suspense fallback={<div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />}>
            <AuthForm asWidget={true} />
          </Suspense>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-16 px-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-16 px-6 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-4">
              <FaExclamationCircle className="text-6xl text-red-600 dark:text-red-400" />
            </div>
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl px-6 py-4 text-center font-semibold shadow mb-4">
              {error}
            </div>
            <Button onClick={() => router.push('/vote')} className="bg-blue-600 hover:bg-blue-700 text-white">
              <FaArrowLeft className="inline mr-2" />
              Geri Dön
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!provider) return null;

  // Provider logo URL'sini belirle
  const getProviderLogo = (type: string) => {
    switch (type) {
      case 'serversmc':
        return '/images/vote-providers/smc.webp';
      default:
        return null;
    }
  };

  const logoUrl = provider.logo || getProviderLogo(provider.type);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="max-w-4xl mx-auto py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="p-4 rounded-full bg-blue-500/20 w-fit mx-auto mb-6">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${provider.type} logo`}
                  width={80}
                  height={80}
                  className="rounded-xl"
                />
              ) : (
                <FaVoteYea className="text-6xl text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Oy Ver
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {provider.type === 'serversmc' ? 'ServersMC' : provider.type} üzerinden oy verin
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 shadow-2xl rounded-3xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={`${provider.type} logo`}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    ) : (
                      <FaVoteYea className="text-2xl text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {provider.type === 'serversmc' ? 'ServersMC' : provider.type}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Bu platform üzerinden sunucumuza oy verebilirsiniz.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vote Status */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/30 dark:border-gray-700/30"
                >
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                    {canVote() ? (
                      <>
                        <FaCheckCircle className="text-green-500 text-xl" />
                        <span className="text-green-600 dark:text-green-400">Oy Verebilirsiniz</span>
                      </>
                    ) : (
                      <>
                        <FaClock className="text-yellow-500 text-xl" />
                        <span className="text-yellow-600 dark:text-yellow-400">Bekleme Süresi</span>
                      </>
                    )}
                  </h3>
                  {!canVote() && user?.nextVoteAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Sonraki oy: {new Date(user.nextVoteAt).toLocaleString('tr-TR')}
                    </p>
                  )}
                </motion.div>

                {/* Success/Error Messages */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-2xl px-6 py-4 text-center font-semibold shadow-xl backdrop-blur-xl border border-green-200 dark:border-green-800"
                  >
                    {success}
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-2xl px-6 py-4 text-center font-semibold shadow-xl backdrop-blur-xl border border-red-200 dark:border-red-800"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Vote Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleVote}
                    disabled={!canVote() || voting}
                    className={`w-full font-semibold py-4 rounded-2xl shadow-xl transition-all duration-300 text-lg ${
                      canVote() && !voting
                        ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white'
                        : 'bg-gray-400 cursor-not-allowed text-white'
                    }`}
                  >
                    {voting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Oy Gönderiliyor...
                      </>
                    ) : canVote() ? (
                      <>
                        <FaVoteYea className="inline mr-2" />
                        Oy Ver
                      </>
                    ) : (
                      <>
                        <FaClock className="inline mr-2" />
                        Bekleme Süresinde
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Back Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={() => router.push('/vote')}
                    variant="outline"
                    className="w-full border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-xl py-3"
                  >
                    <FaArrowLeft className="inline mr-2" />
                    Geri Dön
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
