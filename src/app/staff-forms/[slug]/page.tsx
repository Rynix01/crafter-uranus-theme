"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffFormService } from "@/lib/services/staff-form.service";
import { StaffForm, StaffFormInput } from "@/lib/types/staff-form";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AuthContext } from "@/lib/context/auth.context";
import { FaClipboardList, FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function StaffFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { getForm, submitFormApplication } = useStaffFormService();
  const { user, isLoading, isAuthenticated } = React.useContext(AuthContext);

  const [form, setForm] = useState<StaffForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auth kontrolü ve redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/auth/sign-in?return=/staff-forms/${slug}`);
    }
  }, [isLoading, isAuthenticated, router, slug]);

  // Formu slug ile bul (artık doğrudan getForm(slug) ile)
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setError(null);
    setForm(null);
    setSuccess(false);
    getForm(slug)
      .then((found) => {
        setForm(found);
        // Varsayılan değerleri ayarla
        const initial: Record<string, string> = {};
        found.inputs.forEach((input) => {
          initial[input.name] = "";
        });
        setFormValues(initial);
      })
      .catch(() => setError("Başvuru formu bulunamadı veya yüklenirken bir hata oluştu."))
  }, [slug, isAuthenticated, user, isLoading]);

  // Form alanı değişikliği
  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      // Yeni API: values: [{inputId, value}]
      const values = form.inputs.map((input) => ({
        inputId: input.name, // veya input.index, backend'e göre
        value: formValues[input.name] || "",
      }));
      await submitFormApplication(form.id, values);
      setSuccess(true);
    } catch (err) {
      setError("Başvuru gönderilirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
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
              <FaClipboardList className="text-6xl text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Başvuru Formu
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">
              Formu görüntülemek için giriş yapın
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
            <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-6">
              <FaExclamationCircle className="text-6xl text-red-600 dark:text-red-400" />
            </div>
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-2xl px-8 py-6 text-center font-semibold shadow-lg border border-red-200 dark:border-red-800 mb-6">
              {error}
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/staff-forms")}
              className="rounded-xl px-6 py-3"
            >
              <FaArrowLeft className="mr-2" />
              Tüm Başvuru Formları
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }
  if (!form) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto py-12 px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
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
              <FaClipboardList className="text-7xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 text-white">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {form.description}
            </p>
          )}
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              <CardContent className="p-8">
                {form.inputs.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Form alanı tanımlanmamış.
                  </div>
                )}
                <div className="space-y-6">
                  {form.inputs.map((input, index) => (
                    <motion.div 
                      key={input.name} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="space-y-3"
                    >
                      <Label htmlFor={input.name} className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {input.name}
                      </Label>
                      {input.type === "select" ? (
                        <Select
                          value={formValues[input.name]}
                          onValueChange={(v) => handleChange(input.name, v)}
                        >
                          <SelectTrigger 
                            id={input.name}
                            className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-gray-700/50"
                          >
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {(input as any).options?.map((opt: string) => (
                              <SelectItem key={opt} value={opt} className="rounded-lg">
                                {opt}
                              </SelectItem>
                            )) || <SelectItem value="">Seçenek yok</SelectItem>}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={input.name}
                          type={input.type || "text"}
                          value={formValues[input.name]}
                          onChange={(e) => handleChange(input.name, e.target.value)}
                          required
                          className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-gray-700/50 text-lg"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-2xl px-8 py-6 text-center font-semibold shadow-lg border border-green-200 dark:border-green-800"
                  >
                    <FaCheckCircle className="text-3xl mb-3 mx-auto" />
                    <div className="text-xl mb-4">Başvurunuz başarıyla gönderildi!</div>
                    <Button
                      variant="outline"
                      className="mt-2 border-green-700 dark:border-green-300 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 rounded-xl px-6 py-3"
                      onClick={() => router.push("/staff-forms/applications")}
                    >
                      Başvurularıma Git
                    </Button>
                  </motion.div>
                )}
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl px-6 py-4 text-center font-semibold border border-red-200 dark:border-red-800"
                  >
                    {error}
                  </motion.div>
                )}
              </CardContent>
              
              <CardFooter className="p-8 pt-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button 
                    type="submit" 
                    disabled={submitting || success}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-xl disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Gönderiliyor...
                      </>
                    ) : success ? (
                      <>
                        <FaCheckCircle className="mr-3" />
                        Başarıyla Gönderildi
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-3" />
                        Başvur
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
