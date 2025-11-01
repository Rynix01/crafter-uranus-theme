"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useStaffFormService } from "@/lib/services/staff-form.service";
import { StaffFormApplication } from "@/lib/types/staff-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/context/auth.context";
import {
  FaClipboardCheck,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const AuthForm = dynamic(
  () =>
    import("@/components/widgets/auth-form").then((mod) => ({
      default: mod.AuthForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
    ),
  }
);

const statusBadge = (status: string) => {
  if (status === "PENDING")
    return (
      <motion.span 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-semibold border border-yellow-200 dark:border-yellow-800"
      >
        <FaHourglassHalf className="text-lg" /> Beklemede
      </motion.span>
    );
  if (status === "APPROVED")
    return (
      <motion.span 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 text-sm font-semibold border border-green-200 dark:border-green-800"
      >
        <FaCheckCircle className="text-lg" /> Onaylandı
      </motion.span>
    );
  if (status === "REJECTED")
    return (
      <motion.span 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-200 text-sm font-semibold border border-red-200 dark:border-red-800"
      >
        <FaTimesCircle className="text-lg" /> Reddedildi
      </motion.span>
    );
  return null;
};

export default function StaffApplicationsPage() {
  const router = useRouter();
  const { getMyApplications } = useStaffFormService();
  const { isAuthenticated, isLoading } = React.useContext(AuthContext);
  const [applications, setApplications] = useState<StaffFormApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in?return=/staff-forms/applications");
      return;
    }
    if (!isAuthenticated) return;
    setLoading(true);
    getMyApplications()
      .then((apps) => setApplications(apps))
      .catch(() => setError("Başvurular yüklenemedi."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-16 px-6 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="p-4 rounded-full bg-blue-500/20 w-fit mx-auto mb-4">
              <FaClipboardCheck className="text-6xl text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Başvurularım
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">
              Başvurularınızı görüntülemek için giriş yapın
            </p>
          </motion.div>
          <Suspense
            fallback={
              <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
            }
          >
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
            <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-6">
              <FaExclamationCircle className="text-6xl text-red-600 dark:text-red-400" />
            </div>
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-2xl px-8 py-6 text-center font-semibold shadow-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => router.push('/staff-forms')}
                variant="outline"
                className="rounded-full p-3"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Button>
            </motion.div>
            <div className="p-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 w-fit">
              <FaClipboardCheck className="text-7xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 text-white">
            Başvurularım
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Yaptığınız başvuruların durumunu buradan takip edebilirsiniz.
          </p>
        </motion.div>

        {/* Applications Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {applications.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-20"
            >
              <div className="p-6 rounded-full bg-green-500/20 w-fit mx-auto mb-6">
                <FaCheckCircle className="text-6xl text-green-600 dark:text-green-400" />
              </div>
              <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-2xl px-8 py-6 text-center font-semibold shadow-lg border border-green-200 dark:border-green-800">
                Henüz başvurunuz yok.
              </div>
            </motion.div>
          )}
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <FaClipboardCheck className="text-2xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {app.form?.title || "Form"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-4">{statusBadge(app.status?.toUpperCase?.())}</div>
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <FaCalendarAlt className="text-lg" />
                    <span>Başvuru Tarihi: {new Date(app.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                  {app.form?.slug && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => router.push(`/staff-forms/${app.form?.slug}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Formu Görüntüle
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
