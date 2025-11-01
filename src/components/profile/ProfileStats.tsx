import React from 'react';
import { Coins, Archive, ShoppingBag, MessageSquareHeart, TrendingUp, Users, Award, Zap, Heart } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { animate } from "framer-motion";
import { motion } from "framer-motion";

interface StatItemProps {
    icon: React.ElementType;
    value: number;
    label: string;
    color: string;
    gradient: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, value, label, color, gradient }) => {
    const [count, setCount] = React.useState(0);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

    React.useEffect(() => {
        if (inView) {
            // @ts-ignore: animate is not typed for stop, but works at runtime
            const controls = animate(0, value, {
                duration: 2.5,
                ease: "circOut",
                onUpdate: (latest: number) => setCount(Math.round(latest)),
            });
            return () => {
                // @ts-ignore
                controls.stop();
            };
        }
    }, [inView, value]);

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 rounded-xl group"
        >
            <div className={`p-4 rounded-2xl ${gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <Icon size={28} className="text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2">
                {count}
                {label === 'BAKİYE' && '₺'}
            </div>
            <div className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">{label}</div>
        </motion.div>
    );
};

interface ProfileStatsProps {
    balance: number;
    chestCount: number;
    inventoryCount: number;
    supportCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ balance, chestCount, inventoryCount, supportCount }) => {
    const stats = [
        { 
            label: 'BAKİYE', 
            value: balance, 
            icon: Coins, 
            color: '#34d399',
            gradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
        },
        { 
            label: 'SANDIK', 
            value: chestCount, 
            icon: Archive, 
            color: '#60a5fa',
            gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600'
        },
        { 
            label: 'BEĞENİ', 
            value: inventoryCount, 
            icon: Heart, 
            color: '#f472b6',
            gradient: 'bg-gradient-to-br from-pink-500 to-rose-600'
        },
        { 
            label: 'DESTEK', 
            value: supportCount, 
            icon: MessageSquareHeart, 
            color: '#a78bfa',
            gradient: 'bg-gradient-to-br from-purple-500 to-violet-600'
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden mb-8"
        >
            <div className="p-2">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <StatItem {...stat} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileStats;