"use client";

import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Wallet,
  CoinsIcon,
  BoxIcon,
  UserIcon,
  ChevronDown,
  Bell,
  Settings,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthContext } from "@/lib/context/auth.context";
import { useContext, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { WebsiteContext } from "@/lib/context/website.context";
import { Avatar } from "./ui/avatar";
import { useCart } from "@/lib/context/cart.context";
import { Badge } from "./ui/badge";
import { Head } from "./ui/head";
import { IconRenderer } from "@/components/ui/icon-renderer";
import { WEBSITE_ID } from "@/lib/constants/base";

const formatBalance = (balance: number | undefined): string => {
  if (balance === undefined || balance === null) return "0.00";
  return balance.toFixed(2);
};

export function Navbar() {
  const { isAuthenticated, user, signOut } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const { website } = useContext(WebsiteContext);
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getLinkClassName = (path: string) => {
    const isActive =
      path === "/"
        ? pathname === "/"
        : pathname.startsWith(path) && path !== "/";
    return `px-6 py-3 text-base font-medium transition-all rounded-xl ${
      isActive
        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;
  };

  const navigationItems = website?.theme.navbar;

  const userMenuItems = useMemo(() => {
    const baseItems = [
      { href: "/profile", icon: User, label: "Profilim" },
      { href: "/wallet", icon: Wallet, label: "Cüzdanım" },
      { href: "/chest", icon: BoxIcon, label: "Sandığım" },
      { href: "/settings", icon: Settings, label: "Ayarlar" },
    ];

    if (user?.role?.permissions?.length && user.role.permissions.length > 0) {
      return [
        ...baseItems,
        { href: "/admin", icon: Wrench, label: "Yönetim Paneli" },
      ];
    }

    return baseItems;
  }, [user?.role.permissions.length]);

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems?.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className={getLinkClassName(item.url)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* User Menu or Auth Buttons */}
            {!isAuthenticated ? (
              <>
                {/* Giriş Yap Button */}
                <Link href="/auth/sign-in">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-base hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User className="w-5 h-5" />
                    Giriş Yap
                  </Button>
                </Link>

                {/* Kayıt Ol Button */}
                <Link href="/auth/sign-up">
                  <Button
                    size="lg"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-base font-semibold rounded-xl"
                  >
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="hidden md:flex items-center gap-3 px-4 py-2 text-base hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Head
                        username={user?.username || "steve"}
                        size={32}
                        className="w-8 h-8 rounded-lg"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <CoinsIcon className="w-3 h-3" />
                          {formatBalance(user?.balance)} {website?.currency}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3"
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Çıkış Yap
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="lg"
                className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                {totalItems > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-gray-600 dark:bg-gray-400 text-white"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="lg" className="p-3">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 px-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Mobile Navigation */}
                    <nav className="flex-1 px-4 py-4">
                      <div className="space-y-2">
                        {navigationItems?.map((item) => (
                          <Link
                            key={item.url}
                            href={item.url}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                              pathname === item.url
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <IconRenderer
                                iconName={item.icon}
                                className="w-5 h-5"
                              />
                              {item.label}
                            </div>
                          </Link>
                        ))}

                        <Link
                          href="/cart"
                          className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            pathname === "/cart"
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <ShoppingCart className="w-5 h-5" />
                              {totalItems > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-gray-600 dark:bg-gray-400 text-white"
                                >
                                  {totalItems}
                                </Badge>
                              )}
                            </div>
                            Sepet
                          </div>
                        </Link>
                      </div>
                    </nav>

                    {/* Mobile User Section */}
                    <div className="px-4 py-4 border-t">
                      {isAuthenticated ? (
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Head
                              username={user?.username || "steve"}
                              size={40}
                              className="w-10 h-10 rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <CoinsIcon className="w-3 h-3" />
                                {formatBalance(user?.balance)}{" "}
                                {website?.currency}
                              </p>
                            </div>
                          </div>

                          {/* User Menu Items */}
                          <div className="space-y-1">
                            {userMenuItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link key={item.href} href={item.href}>
                                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          <Button
                            onClick={signOut}
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Çıkış Yap
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Giriş Yapın
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Tüm özelliklerden faydalanın
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link href="/auth/sign-in" className="flex-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Giriş Yap
                              </Button>
                            </Link>
                            <Link href="/auth/sign-up" className="flex-1">
                              <Button
                                size="sm"
                                className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                              >
                                Kayıt Ol
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
