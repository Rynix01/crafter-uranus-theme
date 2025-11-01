"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/lib/context/auth.context";
import { useCart } from "@/lib/context/cart.context";
import { useProductService } from "@/lib/services/product.service";
import {
  useMarketplaceService,
  Coupon,
} from "@/lib/services/marketplace.service";
import { Product } from "@/lib/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Package,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
  Gift,
} from "lucide-react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

interface CartProduct extends Product {
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { getProductById } = useProductService();
  const { purchaseProduct, getCouponInfo, getMarketplaceSettings } =
    useMarketplaceService();

  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [bulkDiscount, setBulkDiscount] = useState<null | {
    type: "percentage" | "fixed";
    amount: number;
    expireDate: string | null;
    products: string[];
  }>(null);

  // Auth kontrolü - eğer auth edilmemişse sign-in sayfasına yönlendir
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/sign-in?return=/cart");
    }
  }, [isLoading, isAuthenticated, router]);

  // Cart ürünlerini yükle
  useEffect(() => {
    const loadCartProducts = async () => {
      if (cart.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      try {
        const products = await Promise.all(
          cart.map(async (item) => {
            try {
              const product = await getProductById(item.id);
              return { ...product, quantity: item.quantity };
            } catch (error) {
              console.error(`Product ${item.id} not found:`, error);
              return null;
            }
          })
        );

        const validProducts = products.filter(
          (p): p is CartProduct => p !== null
        );
        setCartProducts(validProducts);
      } catch (error) {
        console.error("Error loading cart products:", error);
        setCartProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCartProducts();
  }, [cart]);

  // Bulk discount'u çek
  useEffect(() => {
    getMarketplaceSettings().then((settings) => {
      setBulkDiscount(settings.bulkDiscount || null);
    });
  }, []);

  // Kupon kodu uygula
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const coupon = await getCouponInfo(couponCode.trim());

      if (!coupon.isActive) {
        withReactContent(Swal).fire({
          title: "Kupon Aktif Değil",
          text: "Bu kupon kodu artık aktif değil.",
          icon: "error",
          confirmButtonText: "Tamam",
        });
        return;
      }

      // Minimum sepet değeri kontrolü
      if (coupon.minCartValue && subtotal < coupon.minCartValue) {
        withReactContent(Swal).fire({
          title: "Minimum Sepet Değeri",
          text: `Bu kuponu kullanmak için minimum ${coupon.minCartValue.toFixed(
            2
          )} ₺ değerinde alışveriş yapmalısınız.`,
          icon: "warning",
          confirmButtonText: "Tamam",
        });
        return;
      }

      // Ürün kuponu kontrolü (product_discount tipi için)
      if (coupon.type === "product_discount" && coupon.productId) {
        const hasProductInCart = cartProducts.some(
          (product) => product.id === coupon.productId
        );
        if (!hasProductInCart) {
          withReactContent(Swal).fire({
            title: "Ürün Bulunamadı",
            text: "Bu kupon belirli bir ürün için geçerlidir ve sepetinizde bu ürün bulunmamaktadır.",
            icon: "error",
            confirmButtonText: "Tamam",
          });
          return;
        }
      }

      setAppliedCoupon(coupon);

      let successMessage = `${coupon.code} kuponu başarıyla uygulandı!`;
      if (coupon.type === "product_discount") {
        successMessage += ` Belirli ürünlere ${
          coupon.discountType === "percentage"
            ? `%${coupon.discountValue}`
            : `${coupon.discountValue}₺`
        } indirim uygulandı.`;
      } else if (coupon.type === "cart_discount") {
        successMessage += ` Sepete ${
          coupon.discountType === "percentage"
            ? `%${coupon.discountValue}`
            : `${coupon.discountValue}₺`
        } indirim uygulandı.`;
      } else if (coupon.type === "free_product") {
        successMessage += ` Ücretsiz ürün eklendi!`;
      }

      withReactContent(Swal).fire({
        title: "Kupon Uygulandı!",
        text: successMessage,
        icon: "success",
        confirmButtonText: "Tamam",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error: any) {
      console.error("Coupon error:", error);
      withReactContent(Swal).fire({
        title: "Geçersiz Kupon",
        text:
          error.response?.data?.message ||
          "Girdiğiniz kupon kodu geçerli değil.",
        icon: "error",
        confirmButtonText: "Tamam",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  // Kuponu kaldır
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Miktar güncelle
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  // Toplam hesaplama
  const subtotal = cartProducts.reduce((sum, product) => {
    const originalPrice = Number(product.price) || 0;
    const discountValue = Number(product.discountValue);
    const validDiscountType =
      product.discountType === "percentage" || product.discountType === "fixed";
    const hasProductDiscount =
      !isNaN(discountValue) && discountValue > 0 && validDiscountType;
    const productDiscountAmount =
      product.discountType === "percentage"
        ? (originalPrice * discountValue) / 100
        : discountValue;
    const productDiscountedPrice = hasProductDiscount
      ? originalPrice - productDiscountAmount
      : originalPrice;

    // Bulk discount hesaplama
    let hasBulk = false;
    let bulkDiscountAmount = 0;
    let bulkDiscountedPrice = originalPrice;
    if (
      bulkDiscount &&
      bulkDiscount.amount > 0 &&
      (bulkDiscount.products.length === 0 ||
        bulkDiscount.products.includes(product.id))
    ) {
      hasBulk = true;
      if (bulkDiscount.type === "percentage") {
        bulkDiscountAmount = (originalPrice * bulkDiscount.amount) / 100;
      } else {
        bulkDiscountAmount = bulkDiscount.amount;
      }
      bulkDiscountedPrice = originalPrice - bulkDiscountAmount;
    }

    // En iyi indirimi seç (en düşük fiyatı göster)
    let finalPrice = originalPrice;
    if (hasProductDiscount && hasBulk) {
      finalPrice =
        bulkDiscountedPrice < productDiscountedPrice
          ? bulkDiscountedPrice
          : productDiscountedPrice;
    } else if (hasBulk) {
      finalPrice = bulkDiscountedPrice;
    } else if (hasProductDiscount) {
      finalPrice = productDiscountedPrice;
    }

    // Kupon indirimi hesaplama (product_discount tipi için)
    let couponDiscount = 0;
    let hasCouponDiscount = false;
    if (appliedCoupon && appliedCoupon.type === "product_discount") {
      if (!appliedCoupon.productId || product.id === appliedCoupon.productId) {
        hasCouponDiscount = true;
        if (appliedCoupon.discountType === "percentage") {
          couponDiscount = (finalPrice * appliedCoupon.discountValue) / 100;
        } else {
          couponDiscount = appliedCoupon.discountValue;
        }
      }
    }

    const finalPriceWithCoupon = finalPrice - couponDiscount;

    return sum + finalPriceWithCoupon * product.quantity;
  }, 0);

  // Kupon indirimi hesaplama (cart_discount tipi için)
  const cartCouponDiscount =
    appliedCoupon && appliedCoupon.type === "cart_discount"
      ? appliedCoupon.discountType === "percentage"
        ? (subtotal * appliedCoupon.discountValue) / 100
        : appliedCoupon.discountValue
      : 0;

  const total = subtotal - cartCouponDiscount;

  // Sepeti temizle
  const handleClearCart = () => {
    withReactContent(Swal)
      .fire({
        title: "Sepeti Temizle",
        text: "Sepetinizdeki tüm ürünleri kaldırmak istediğinize emin misiniz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Evet, temizle",
        cancelButtonText: "İptal",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          clearCart();
          setAppliedCoupon(null);
          setCouponCode("");
        }
      });
  };

  // Satın alma işlemi
  const handlePurchase = () => {
    if (cartProducts.length === 0) {
      withReactContent(Swal).fire({
        title: "Boş Sepet",
        text: "Sepetinizde ürün bulunmamaktadır.",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return;
    }

    const productIds = cartProducts.map((product) => product.id);
    const couponCodeToUse = appliedCoupon ? appliedCoupon.code : undefined;

    withReactContent(Swal)
      .fire({
        title: "Satın Alma İşlemi",
        text: `Sepetinizdeki ${cartProducts.length} ürünü satın almak istediğinize emin misiniz?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Evet, satın al",
        cancelButtonText: "Hayır, iptal et",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          purchaseProduct(productIds, couponCodeToUse)
            .then((data) => {
              withReactContent(Swal)
                .fire({
                  title: "Satın Alma Başarılı",
                  text: "Ürünler başarıyla satın alındı. Sandığa yönlendiriliyorsunuz...",
                  icon: "success",
                  confirmButtonText: "Tamam",
                  timer: 2000,
                  timerProgressBar: true,
                })
                .then(() => {
                  clearCart();
                  setAppliedCoupon(null);
                  setCouponCode("");
                  router.push("/chest");
                });
            })
            .catch((error) => {
              withReactContent(Swal).fire({
                title: "Satın Alma Hatası",
                text:
                  error.message || "Bir hata oluştu. Lütfen tekrar deneyin.",
                icon: "error",
                confirmButtonText: "Tamam",
              });
            });
        }
      });
  };

  if (!user) {
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

  if (!isAuthenticated) {
    return null; // Router zaten yönlendirme yapacak
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Sepet yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Sepetim
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Seçtiğiniz ürünleri inceleyin ve ödeme işlemini tamamlayın
          </p>
        </div>

        {cartProducts.length === 0 ? (
          // Empty Cart State
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              🛒
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Sepetiniz boş
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Henüz sepetinize ürün eklemediniz. Mağazamızı keşfedin ve favori
              ürünlerinizi sepete ekleyin.
            </p>
            <Button
              onClick={() => router.push("/store")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              <Package className="h-4 w-4 mr-2" />
              Mağazaya Git
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Sepet Ürünleri ({cartProducts.length})
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Sepeti Temizle
                  </Button>
                </div>

                <div className="space-y-4">
                  {cartProducts.map((product) => {
                    const originalPrice = Number(product.price) || 0;
                    const discountValue = Number(product.discountValue);
                    const validDiscountType =
                      product.discountType === "percentage" ||
                      product.discountType === "fixed";
                    const hasProductDiscount =
                      !isNaN(discountValue) &&
                      discountValue > 0 &&
                      validDiscountType;
                    const productDiscountAmount =
                      product.discountType === "percentage"
                        ? (originalPrice * discountValue) / 100
                        : discountValue;
                    const productDiscountedPrice = hasProductDiscount
                      ? originalPrice - productDiscountAmount
                      : originalPrice;

                    // Bulk discount hesaplama
                    let hasBulk = false;
                    let bulkDiscountAmount = 0;
                    let bulkDiscountedPrice = originalPrice;
                    if (
                      bulkDiscount &&
                      bulkDiscount.amount > 0 &&
                      (bulkDiscount.products.length === 0 ||
                        bulkDiscount.products.includes(product.id))
                    ) {
                      hasBulk = true;
                      if (bulkDiscount.type === "percentage") {
                        bulkDiscountAmount =
                          (originalPrice * bulkDiscount.amount) / 100;
                      } else {
                        bulkDiscountAmount = bulkDiscount.amount;
                      }
                      bulkDiscountedPrice = originalPrice - bulkDiscountAmount;
                    }

                    // En iyi indirimi seç (en düşük fiyatı göster)
                    let finalPrice = originalPrice;
                    let showDiscountType: "product" | "bulk" | null = null;
                    let showDiscountAmount = 0;
                    if (hasProductDiscount && hasBulk) {
                      if (bulkDiscountedPrice < productDiscountedPrice) {
                        finalPrice = bulkDiscountedPrice;
                        showDiscountType = "bulk";
                        showDiscountAmount = bulkDiscountAmount;
                      } else {
                        finalPrice = productDiscountedPrice;
                        showDiscountType = "product";
                        showDiscountAmount = productDiscountAmount;
                      }
                    } else if (hasBulk) {
                      finalPrice = bulkDiscountedPrice;
                      showDiscountType = "bulk";
                      showDiscountAmount = bulkDiscountAmount;
                    } else if (hasProductDiscount) {
                      finalPrice = productDiscountedPrice;
                      showDiscountType = "product";
                      showDiscountAmount = productDiscountAmount;
                    }

                    // Kupon indirimi hesaplama (product_discount tipi için)
                    let couponDiscount = 0;
                    let hasCouponDiscount = false;
                    if (
                      appliedCoupon &&
                      appliedCoupon.type === "product_discount"
                    ) {
                      if (
                        !appliedCoupon.productId ||
                        product.id === appliedCoupon.productId
                      ) {
                        hasCouponDiscount = true;
                        if (appliedCoupon.discountType === "percentage") {
                          couponDiscount =
                            (finalPrice * appliedCoupon.discountValue) / 100;
                        } else {
                          couponDiscount = appliedCoupon.discountValue;
                        }
                      }
                    }

                    const finalPriceWithCoupon = finalPrice - couponDiscount;

                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                            <Link
                              href={`/store/product/${product.id}`}
                              className="hover:underline focus:underline"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
                            {product.description}
                          </p>

                          {/* Price Display */}
                          <div className="flex items-center gap-2 mt-1">
                            {showDiscountType && showDiscountAmount > 0 ? (
                              <>
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  {originalPrice.toFixed(2)} ₺
                                </span>
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                  {finalPrice <= 0
                                    ? "Ücretsiz"
                                    : `${finalPrice.toFixed(2)} ₺`}
                                </span>
                                <Badge className="bg-red-500 dark:bg-red-700 text-white text-xs">
                                  {showDiscountType === "bulk" && bulkDiscount
                                    ? bulkDiscount.type === "percentage"
                                      ? `%${bulkDiscount.amount} İndirim`
                                      : `${bulkDiscount.amount.toFixed(
                                          0
                                        )}₺ İndirim`
                                    : product.discountType === "percentage"
                                    ? `%${discountValue} İndirim`
                                    : `${productDiscountAmount.toFixed(
                                        0
                                      )}₺ İndirim`}
                                </Badge>
                              </>
                            ) : (
                              <span className="font-semibold text-gray-800 dark:text-gray-100">
                                {originalPrice <= 0
                                  ? "Ücretsiz"
                                  : `${originalPrice.toFixed(2)} ₺`}
                              </span>
                            )}

                            {/* Kupon indirimi gösterimi */}
                            {hasCouponDiscount && (
                              <>
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  {finalPrice <= 0
                                    ? "Ücretsiz"
                                    : `${finalPrice.toFixed(2)} ₺`}
                                </span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {finalPriceWithCoupon <= 0
                                    ? "Ücretsiz"
                                    : `${finalPriceWithCoupon.toFixed(2)} ₺`}
                                </span>
                                <Badge className="bg-blue-500 dark:bg-blue-700 text-white text-xs">
                                  {appliedCoupon?.discountType === "percentage"
                                    ? `%${appliedCoupon.discountValue}`
                                    : `${couponDiscount.toFixed(0)}₺`}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(
                                product.id,
                                product.quantity - 1
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {product.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(
                                product.id,
                                product.quantity + 1
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Total Price for this item */}
                        <div className="text-right min-w-[80px]">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {finalPriceWithCoupon * product.quantity <= 0
                              ? "Ücretsiz"
                              : `${(
                                  finalPriceWithCoupon * product.quantity
                                ).toFixed(2)} ₺`}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(product.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Sipariş Özeti
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Coupon Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Kupon Kodu
                    </h4>

                    {appliedCoupon ? (
                      <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-300">
                              {appliedCoupon.code}
                            </span>
                            {appliedCoupon.type === "free_product" && (
                              <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeCoupon}
                            className="h-6 w-6 p-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                          {appliedCoupon.type === "product_discount" &&
                            (appliedCoupon.discountType === "percentage"
                              ? `Belirli ürünlere %${appliedCoupon.discountValue} indirim`
                              : `Belirli ürünlere ${appliedCoupon.discountValue}₺ indirim`)}
                          {appliedCoupon.type === "cart_discount" &&
                            (appliedCoupon.discountType === "percentage"
                              ? `Sepete %${appliedCoupon.discountValue} indirim`
                              : `Sepete ${appliedCoupon.discountValue}₺ indirim`)}
                          {appliedCoupon.type === "free_product" &&
                            "Ücretsiz ürün eklendi"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Kupon kodunuz"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => e.key === "Enter" && applyCoupon()}
                        />
                        <Button
                          onClick={applyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {couponLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            "Uygula"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Ara Toplam
                        </span>
                        <span className="font-medium">
                          {subtotal <= 0
                            ? "Ücretsiz"
                            : `${subtotal.toFixed(2)} ₺`}
                        </span>
                      </div>

                      {appliedCoupon &&
                        appliedCoupon.type === "cart_discount" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600 dark:text-green-400">
                              Kupon İndirimi
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              -{cartCouponDiscount.toFixed(2)} ₺
                            </span>
                          </div>
                        )}

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                          <span className="text-gray-800 dark:text-gray-100">
                            Toplam
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">
                            {total <= 0 ? "Ücretsiz" : `${total.toFixed(2)} ₺`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handlePurchase}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-medium mt-6"
                      disabled={cartProducts.length === 0}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Satın Al
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>

                    {/* Continue Shopping */}
                    <Button
                      variant="outline"
                      onClick={() => router.push("/store")}
                      className="w-full mt-3"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Alışverişe Devam Et
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
