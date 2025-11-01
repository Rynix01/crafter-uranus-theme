// components/profile/AnimatedProfileTabs.tsx
import React from 'react';
import { Button } from '../ui/button';
import { Layers, Heart, MessageCircle, Star, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
  label: string;
  count?: number;
  content: React.ReactNode;
}

interface ProfileTabsProps {
  tabs: Tab[];
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const getTabIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'beğeniler':
        return <Heart className="h-4 w-4" />;
      case 'yorumlar':
        return <MessageCircle className="h-4 w-4" />;
      case 'yıldızlı ürünler':
        return <Star className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden mb-8"
    >
      <div className="p-6 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 flex items-center">
          <div className="p-2 rounded-xl bg-purple-500/20 mr-3">
            <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          Aktivite Sekmeleri
        </h3>
      </div>
      
      <div className="flex border-b border-white/20 dark:border-gray-700/50">
        {tabs.map((tab, index) => (
          <Button
            key={tab.label}
            variant="ghost"
            onClick={() => setActiveTab(index)}
            className={`flex-1 rounded-none border-b-2 border-transparent hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 ${
              activeTab === index 
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              {getTabIcon(tab.label)}
              {tab.label}
              {tab.count !== undefined && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === index 
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tab.count}
                </motion.span>
              )}
            </span>
          </Button>
        ))}
      </div>
      
      <div className="p-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {tabs[activeTab].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfileTabs;