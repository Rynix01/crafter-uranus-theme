import React from 'react';
import { Button } from '../ui/button';
import { Flag, Ban, Shield, AlertTriangle } from 'lucide-react';
import { PERMISSIONS } from '@/lib/constants/permissions';
import type { User } from '@/lib/types/user';
import { motion } from 'framer-motion';

interface ProfileModerationPanelProps {
  currentUser: User | null;
  user: User;
  onReport: () => void;
  onBan?: () => void;
}

const ProfileModerationPanel: React.FC<ProfileModerationPanelProps> = ({ 
  currentUser, 
  user, 
  onReport, 
  onBan 
}) => {
  const isSelf = currentUser && user.id === currentUser.id;
  const canBan = currentUser?.role.permissions.includes(PERMISSIONS.MANAGE_USERS);

  if (isSelf) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
    >
      <div className="p-6 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 flex items-center">
          <div className="p-2 rounded-xl bg-red-500/20 mr-3">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          Moderasyon İşlemleri
        </h3>
      </div>
      
      <div className="p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button 
            onClick={onReport} 
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 py-3 rounded-xl"
          >
            <Flag className="h-5 w-5" />
            <span className="font-semibold">Rapor Et</span>
          </Button>
        </motion.div>
        
        {canBan && onBan && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={onBan} 
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 py-3 rounded-xl"
            >
              <Ban className="h-5 w-5" />
              <span className="font-semibold">
                {user.banned ? 'Yasağı Kaldır' : 'Yasakla'}
              </span>
            </Button>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
        >
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Dikkat</span>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            Bu işlemler geri alınamaz. Lütfen dikkatli olun.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileModerationPanel; 