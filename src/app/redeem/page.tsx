"use client";

import { useState, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/context/auth.context";
import { useRedeemService } from "@/lib/services/redeem.service";
import type { RedeemCodeResponse } from "@/lib/services/redeem.service";
import { FaGift, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function RedeemPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | RedeemCodeResponse>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading, reloadUser } = useContext(AuthContext);
  const { redeemCode } = useRedeemService();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await redeemCode(code);
      setResult(res);

      // If redeem was successful (has bonus or products), reload user data and show success notification
      if (res.bonus || (res.products && res.products.length > 0)) {
        await reloadUser();

        // Clear the input field after successful redemption
        setCode("");

        // Show beautiful success notification
        const bonusText = res.bonus ? `💰 ${res.bonus} Kredi Bonusu` : "";
        const productsText =
          res.products && res.products.length > 0
            ? `🎁 ${res.products.length} Ürün Kazandınız!`
            : "";

        Swal.fire({
          title: "🎉 Tebrikler!",
          html: `
            <div class="text-center">
              <div class="mb-4">
                <i class="fas fa-gift text-6xl text-green-500 mb-4"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">Kupon Kodu Başarıyla Kullanıldı!</h3>
              ${
                res.message
                  ? `<p class="text-gray-600 mb-3">${res.message}</p>`
                  : ""
              }
              ${
                bonusText
                  ? `<div class="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-2 font-semibold">${bonusText}</div>`
                  : ""
              }
              ${
                productsText
                  ? `<div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg mb-2 font-semibold">${productsText}</div>`
                  : ""
              }
              ${
                res.products && res.products.length > 0
                  ? `
                <div class="mt-3 text-left">
                  <p class="font-semibold text-gray-700 mb-2">Kazanılan Ürünler:</p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    ${res.products
                      .map((product) => `<li>• ${product.name}</li>`)
                      .join("")}
                  </ul>
                </div>
              `
                  : ""
              }
            </div>
          `,
          icon: "success",
          confirmButtonText: "Harika!",
          confirmButtonColor: "#10b981",
          background: "#f8fafc",
          customClass: {
            popup: "rounded-2xl shadow-2xl",
            confirmButton: "px-8 py-3 text-lg font-semibold rounded-xl",
          },
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Bir hata oluştu.";
      setError(errorMessage);

      // Show error notification
      Swal.fire({
        title: "❌ Hata!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#ef4444",
        background: "#fef2f2",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          confirmButton: "px-8 py-3 text-lg font-semibold rounded-xl",
        },
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoading && !isAuthenticated) {
    return router.push("/auth/sign-in?return=/redeem");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <FaGift className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Hediye Kodu Kullan
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Kredi veya ürün kazanmak için elinizdeki hediye kodunu girin
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto">
          <form onSubmit={handleRedeem} className="w-full flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Hediye Kodu
              </label>
              <Input
                placeholder="Hediye kodunu giriniz"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
                className="text-lg px-4 py-3"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 text-lg"
              disabled={loading || !isAuthenticated || !code.trim()}
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <FaGift className="h-4 w-4 mr-2" />
                  Kodu Kullan
                </>
              )}
            </Button>
          </form>
          {loading && (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Kod kontrol ediliyor...
              </p>
            </div>
          )}

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                result.bonus || (result.products && result.products.length)
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.bonus || (result.products && result.products.length) ? (
                  <FaCheckCircle className="text-green-500 text-xl" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-xl" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {result.bonus || (result.products && result.products.length)
                    ? "Başarılı!"
                    : "Hata!"}
                </h3>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                {result.message && <div className="mb-2">{result.message}</div>}
                {result.bonus && (
                  <div className="mb-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-800 dark:text-green-200 font-semibold">
                    💰 Bakiye Bonusu: {result.bonus}
                  </div>
                )}
                {result.products && result.products.length > 0 && (
                  <div className="mb-2">
                    <p className="font-semibold mb-1">🎁 Kazanılan Ürünler:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      {result.products.map((product) => (
                        <li key={product.id} className="text-sm">
                          {product.name}{" "}
                          <span className="text-xs text-gray-400">
                            ({product.id})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!result.bonus &&
                  (!result.products || result.products.length === 0) && (
                    <span>Herhangi bir bonus veya ürün bulunamadı.</span>
                  )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <FaTimesCircle className="text-red-500 text-xl" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Hata!
                </h3>
              </div>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
