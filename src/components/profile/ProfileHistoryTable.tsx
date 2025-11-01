// components/profile/ProfileHistoryTimeline.tsx
import React from 'react';
import { Award, CreditCard, MessageCircle, ShoppingCart, Circle, History, Clock, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// İkonları işlem türüne göre eşleştirelim
const eventIcons: { [key: string]: React.ReactNode } = {
    payment: <CreditCard className="h-5 w-5 text-green-500" />,
    purchase: <ShoppingCart className="h-5 w-5 text-blue-500" />,
    comment: <MessageCircle className="h-5 w-5 text-purple-500" />,
    achievement: <Award className="h-5 w-5 text-yellow-500" />,
    default: <Circle className="h-5 w-5 text-gray-500" />,
};

const eventColors: { [key: string]: string } = {
    payment: 'bg-green-500',
    purchase: 'bg-blue-500',
    comment: 'bg-purple-500',
    achievement: 'bg-yellow-500',
    default: 'bg-gray-500',
};

interface TimelineEvent {
    id: string | number;
    type: 'payment' | 'purchase' | 'comment' | 'achievement' | 'default';
    title: string;
    description?: string;
    timestamp: string;
}

interface ProfileHistoryTimelineProps {
    events: TimelineEvent[];
    emptyText?: string;
}

const ProfileHistoryTimeline: React.FC<ProfileHistoryTimelineProps> = ({ 
    events, 
    emptyText = 'Kayıt bulunamadı.' 
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden mb-8"
        >
            <div className="p-6 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 flex items-center">
                    <div className="p-2 rounded-xl bg-green-500/20 mr-3">
                        <History className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    Aktivite Geçmişi
                </h3>
            </div>
            
            <div className="p-6">
                {(!events || events.length === 0) ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-500 dark:text-gray-400 py-12"
                    >
                        <History className="mx-auto h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">{emptyText}</p>
                        <p className="text-sm mt-2">Henüz aktivite kaydı bulunmuyor.</p>
                    </motion.div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500/50 via-blue-500/50 to-purple-500/50 rounded-full" />
                        <div className="space-y-6">
                            {events.map((event, index) => (
                                <motion.div 
                                    key={event.id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="relative flex items-start gap-6 group"
                                >
                                    <div className={`absolute left-8 top-3 w-4 h-4 rounded-full ${eventColors[event.type] || eventColors.default} -translate-x-1/2 shadow-lg group-hover:scale-125 transition-transform duration-300 z-10`} />
                                    <div className="ml-16 flex-1 p-4 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 border border-white/20 dark:border-gray-600/30">
                                        <div className="flex items-center gap-3 mb-2">
                                            {eventIcons[event.type] || eventIcons.default}
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{event.title}</h4>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            <span>{event.timestamp}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProfileHistoryTimeline;