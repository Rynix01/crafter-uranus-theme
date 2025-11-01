import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import {
  Flag,
  Ban,
  Edit,
  KeyRound,
  ShieldCheck,
  CalendarDays,
  MessageSquare,
  Crown,
  Star,
  Award,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { User } from "@/lib/types/user";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  user: User;
  currentUser: User | null;
  onReport: () => void;
  onBan?: () => void;
  onEdit?: () => void;
  onChangePassword?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  currentUser,
  onReport,
  onBan,
  onEdit,
  onChangePassword,
}) => {
  const isSelf = currentUser && user.id === currentUser.id;
  const canBan = currentUser?.role.permissions.includes(
    PERMISSIONS.MANAGE_USERS
  );
  const roleColor = user.role?.color || "#a855f7";

  // Tarih formatlaması için (opsiyonel)
  const formattedJoinDate = new Date(user.createdAt).toLocaleDateString(
    "tr-TR",
    {
      year: "numeric",
      month: "long",
    }
  );

  return (
    <>
      {/* Banlı kullanıcı uyarısı */}
      {user.banned && user.bannedBy && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center mb-6"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-lg font-bold py-4 px-6 rounded-xl shadow-2xl border border-red-500/50 backdrop-blur-sm animate-pulse text-center max-w-2xl">
            <div className="flex items-center justify-center gap-2">
              <Ban className="h-5 w-5" />
              <span>Bu kullanıcı yasaklanmıştır</span>
            </div>
            {user.bannedAt && (
              <div className="text-sm mt-1 opacity-90">
                {new Date(user.bannedAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="relative w-full">
        {/* Modern Banner Bölümü */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000" />
          </div>
        </motion.div>

        {/* Modern Eylem Düğmeleri */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-4 right-4 z-20 flex items-center gap-3"
        >
          {isSelf ? (
            <>
              <Button
                onClick={onEdit}
                size="sm"
                className="bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md text-white transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Edit size={16} className="mr-2" />
                Profili Düzenle
              </Button>
              <Button
                onClick={onChangePassword}
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md text-white transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <KeyRound size={16} className="mr-2" />
                Şifre Değiştir
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onReport}
                size="sm"
                variant="destructive"
                className="bg-red-500/80 hover:bg-red-500 border border-red-400/50 backdrop-blur-md text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
              >
                <Flag size={16} className="mr-2" />
                Rapor Et
              </Button>
              {canBan && onBan && (
                <Button
                  onClick={onBan}
                  size="sm"
                  className="bg-yellow-500/80 hover:bg-yellow-500 border border-yellow-400/50 backdrop-blur-md text-white shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Ban size={16} className="mr-2" />
                  {user.banned ? "Yasağı kaldır" : "Yasakla"}
                </Button>
              )}
            </>
          )}
        </motion.div>

        {/* Modern Ana Profil Kartı */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative px-4 sm:px-6 -mt-20"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-visible hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-8 text-center">
              {/* Modern Avatar */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
                className="relative w-40 h-40 mx-auto -mt-28 mb-6"
              >
                <div
                  className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                  style={{
                    background: `linear-gradient(45deg, ${roleColor}40, #3b82f640, #8b5cf640)`,
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                <Avatar
                  username={user.username}
                  size={144}
                  className="w-40 h-40 border-4 border-white/60 dark:border-gray-800/60 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-300"
                />
                
                {/* Role Badge */}
                {user.role && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="absolute -bottom-2 -right-2 z-20"
                  >
                    <div className="relative">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: roleColor }}
                      >
                        {user.role.name.toLowerCase().includes('admin') ? (
                          <Crown className="w-4 h-4 text-white" />
                        ) : user.role.name.toLowerCase().includes('mod') ? (
                          <ShieldCheck className="w-4 h-4 text-white" />
                        ) : (
                          <Star className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Modern Kullanıcı Bilgileri */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
                <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {user.username}
                </h1>
                {user.role && (
                  <Badge
                    className="px-4 py-2 text-sm font-bold uppercase tracking-wider border-0 cursor-pointer transition-all hover:scale-105 shadow-lg"
                    style={{
                      backgroundColor: `${roleColor}e0`,
                      boxShadow: `0 8px 32px ${roleColor}40`,
                    }}
                  >
                    <ShieldCheck size={16} className="mr-2" />
                    {user.role.name}
                  </Badge>
                )}
                <p className="text-gray-600 dark:text-gray-400 font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                  {user.email}
                </p>
              </motion.div>

              {/* Modern İstatistikler Bölümü */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="mt-8 flex justify-center items-center gap-6 sm:gap-12 text-gray-700 dark:text-gray-300 border-t border-gray-200/50 dark:border-gray-700/50 pt-8"
              >
                <div className="flex flex-col items-center group">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <CalendarDays size={20} className="text-blue-500" />
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formattedJoinDate}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
                    Katılım Tarihi
                  </span>
                </div>
                
                <div className="w-px h-12 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700" />
                
                <div className="flex flex-col items-center group">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <MessageSquare size={20} className="text-purple-500" />
                    <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {user.messages?.length || 0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
                    Gönderi
                  </span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ProfileHeader;
