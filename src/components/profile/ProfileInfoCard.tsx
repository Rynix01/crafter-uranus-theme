import React from 'react';
import { Button } from '../ui/button';
import { Calendar, Clock, Mail, Copy, Check, User, Share2, Shield, Globe, Phone } from 'lucide-react';
import { FaDiscord, FaInstagram, FaTwitter, FaYoutube, FaGithub, FaTiktok } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProfileInfoCardProps {
    user: { email: string; createdAt: string };
    lastLogin?: string;
    socialLinks?: { [key: string]: string };
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user, lastLogin, socialLinks }) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(user.email);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const socialIcons = {
        discord: { icon: FaDiscord, color: "#5865F2", name: "Discord" },
        instagram: { icon: FaInstagram, color: "#E4405F", name: "Instagram" },
        twitter: { icon: FaTwitter, color: "#1DA1F2", name: "Twitter" },
        youtube: { icon: FaYoutube, color: "#FF0000", name: "YouTube" },
        github: { icon: FaGithub, color: "#333333", name: "GitHub" },
        tiktok: { icon: FaTiktok, color: "#000000", name: "TikTok" }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
        >
            <div className="p-6 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 flex items-center">
                    <div className="p-2 rounded-xl bg-blue-500/20 mr-3">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Hesap Bilgileri
                </h3>
            </div>

            <div className="p-6 space-y-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 group"
                >
                    <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Katılım Tarihi</p>
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{user.createdAt}</p>
                    </div>
                </motion.div>

                {lastLogin && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 group"
                    >
                        <div className="p-3 rounded-xl bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Son Giriş</p>
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{lastLogin}</p>
                        </div>
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 group"
                >
                    <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-posta</p>
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate font-mono">
                            {user.email}
                        </p>
                    </div>
                    <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 hover:bg-blue-500/20 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                    >
                        {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </Button>
                </motion.div>

                {socialLinks && Object.keys(socialLinks).length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-6 border-t border-white/20 dark:border-gray-700/50"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-purple-500/20">
                                <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">Sosyal Medya</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(socialLinks).map(([key, href]) => {
                                const social = socialIcons[key as keyof typeof socialIcons];
                                if (!social) return null;

                                return (
                                    <Link
                                        key={key}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 group"
                                    >
                                        <div 
                                            className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-300"
                                            style={{ backgroundColor: `${social.color}20` }}
                                        >
                                            <social.icon className="h-5 w-5" style={{ color: social.color }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {social.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default ProfileInfoCard;