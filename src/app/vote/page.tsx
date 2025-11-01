"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useVoteService } from "@/lib/services/vote.service";
import { VoteProvider } from "@/lib/types/vote";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/context/auth.context";
import { FaVoteYea, FaCheckCircle, FaExclamationCircle, FaClock } from "react-icons/fa";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const AuthForm = dynamic(() => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function VotePage() {
  const router = useRouter();
  const { getProviders } = useVoteService();
  const { isAuthenticated, isLoading, user } = React.useContext(AuthContext);
  const [providers, setProviders] = useState<VoteProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kullanıcının oy kullanabilir durumunu kontrol et
  const canVote = () => {
    if (!user?.nextVoteAt) return true;
    return new Date() > new Date(user.nextVoteAt);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in?return=/vote");
      return;
    }
    if (!isAuthenticated) return;

    setLoading(true);
    getProviders()
      .then((data) => setProviders(data.filter(p => p.isActive)))
      .catch(() => setError("Vote provider'ları yüklenemedi."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

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

  if (error) {
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
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="max-w-6xl mx-auto py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="p-4 rounded-full bg-blue-500/20 w-fit mx-auto mb-6">
            <FaVoteYea className="text-6xl text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Oy Ver
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-8">
            Sunucumuza oy vererek bize destek olabilirsiniz. Aşağıdaki platformlardan birini seçin.
          </p>
          
          {/* Vote Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-auto mb-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="font-semibold mb-3 flex items-center justify-center gap-2">
              {canVote() ? (
                <>
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Oy Verebilirsiniz</span>
                </>
              ) : (
                <>
                  <FaClock className="text-yellow-500" />
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
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : providers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-16"
            >
              <div className="p-4 rounded-full bg-yellow-500/20 w-fit mx-auto mb-4">
                <FaExclamationCircle className="text-6xl text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-xl px-6 py-4 text-center font-semibold shadow">
                Şu anda aktif vote provider bulunmuyor.
              </div>
            </motion.div>
          ) : (
            providers.map((provider, index) => {
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
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-3xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                          {logoUrl ? (
                            <Image
                              src={logoUrl}
                              alt={`${provider.type} logo`}
                              width={32}
                              height={32}
                              className="rounded-lg"
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
                            {provider.type === 'serversmc' 
                              ? 'ServersMC platformu üzerinden oy verin' 
                              : `${provider.type} platformu üzerinden oy verin`
                            }
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={() => router.push(`/vote/${provider.id}`)} 
                          className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 text-lg group ${
                            canVote() 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105' 
                              : 'bg-gray-400 cursor-not-allowed text-white'
                          }`}
                          disabled={!canVote()}
                        >
                          {canVote() ? (
                            <>
                              <FaVoteYea className="mr-2" />
                              Oy Ver
                            </>
                          ) : (
                            <>
                              <FaClock className="mr-2" />
                              Bekleme Süresinde
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
