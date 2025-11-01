import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar } from '../ui/avatar';
import { Send, MessageCircle, CornerDownRight, Heart, Reply } from 'lucide-react';
import type { User, WallMessage } from '@/lib/types/user';
import { useUserService } from '@/lib/services/user.service';
import { motion, AnimatePresence } from 'framer-motion';

// Backend'den gelen WallMessage yapısı hem sender hem user içerebilir, tipleri gevşetiyoruz
type WallMessageAny = any;

interface WallProps {
  currentUser: User | null;
  profileUser: User;
  initialMessages?: WallMessage[];
}

const Wall: React.FC<WallProps> = ({ currentUser, profileUser, initialMessages = [] }) => {
  const userService = useUserService();
  const [messages, setMessages] = useState<WallMessageAny[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [replyLoading, setReplyLoading] = useState<{ [key: string]: boolean }>({});

  // Mesajları backend'den çek
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await userService.getWallMessages(profileUser.id);
        // API User döndürüyor, wallMessages içinden al
        setMessages(data || []);
      } catch (e) {
        setMessages([]);
      }
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [profileUser.id]);

  // Mesaj gönder
  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;
    setLoading(true);
    try {
      // Optimistik yeni mesaj objesi
      const newMsg = {
        id: Math.random().toString(36).substr(2, 9),
        content: input,
        createdAt: new Date().toISOString(),
        sender: currentUser,
        replies: [],
      };
      setMessages(prev => [newMsg, ...prev]);
      setInput('');
      await userService.sendWallMessage(profileUser.id, '', input);
      // (isteğe bağlı: backend'den tekrar fetch edilebilir, ama anlık ekranda gösterilecek)
    } finally {
      setLoading(false);
    }
  };

  // Yanıt gönder
  const handleReply = async (msgId: string) => {
    if (!replyInputs[msgId]?.trim() || !currentUser) return;
    setReplyLoading((prev) => ({ ...prev, [msgId]: true }));
    try {
      // Optimistik yeni yanıt objesi
      const newReply = {
        id: Math.random().toString(36).substr(2, 9),
        content: replyInputs[msgId],
        createdAt: new Date().toISOString(),
        sender: currentUser,
        replies: [],
      };
      setMessages(prevMsgs => prevMsgs.map(msg =>
        msg.id === msgId
          ? { ...msg, replies: [...(msg.replies || []), newReply] }
          : msg
      ));
      setReplyInputs((prev) => ({ ...prev, [msgId]: '' }));
      await userService.replyWallMessage(profileUser.id, msgId, replyInputs[msgId]);
      // (isteğe bağlı: backend'den tekrar fetch edilebilir, ama anlık ekranda gösterilecek)
    } finally {
      setReplyLoading((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  // Yanıt inputunu güncelle
  const handleReplyInput = (msgId: string, value: string) => {
    setReplyInputs((prev) => ({ ...prev, [msgId]: value }));
  };

  // Mesaj ve yanıtları render eden yardımcı fonksiyon
  const renderMessage = (msg: WallMessage, isReply = false) => {
    const userObj = msg.sender;

    return (
      <motion.div 
        key={msg.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-4 items-start p-4 rounded-xl ${
          isReply ? 'ml-8 bg-white/10 dark:bg-gray-700/20 border border-white/20 dark:border-gray-600/30' : 'hover:bg-white/10 dark:hover:bg-gray-700/30'
        } transition-all duration-300 group`}
      >
        <Avatar 
          username={userObj?.username || 'Kullanıcı'} 
          className={`w-10 h-10 flex-shrink-0 border-2 border-white/30 dark:border-gray-600/30 shadow-lg group-hover:scale-105 transition-transform duration-300`} 
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
              {userObj?.username || 'Kullanıcı'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {new Date(msg.createdAt).toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {msg.content}
          </div>
          
          {/* Yanıtlar */}
          {msg.replies && msg.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {msg.replies.map((reply: WallMessageAny) => renderMessage(reply, true))}
            </div>
          )}
          
          {/* Yanıt inputu */}
          {currentUser && !isReply && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-3 mt-3 items-center"
            >
              <Input
                value={replyInputs[msg.id] || ''}
                onChange={e => handleReplyInput(msg.id, e.target.value)}
                placeholder="Yanıt yaz..."
                disabled={replyLoading[msg.id]}
                onKeyDown={e => { if (e.key === 'Enter') handleReply(msg.id); }}
                className="flex-1 bg-white/50 dark:bg-gray-700/50 border-white/30 dark:border-gray-600/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
              />
              <Button
                onClick={() => handleReply(msg.id)}
                disabled={replyLoading[msg.id] || !(replyInputs[msg.id]?.trim())}
                className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 rounded-xl px-4"
              >
                <Reply className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden mb-8"
    >
      <div className="p-6 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 flex items-center">
          <div className="p-2 rounded-xl bg-blue-500/20 mr-3">
            <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          Kullanıcı Duvarı
        </h3>
      </div>
      
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 dark:text-gray-400 py-12"
            >
              <MessageCircle className="mx-auto h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Henüz mesaj yok.</p>
              <p className="text-sm mt-2">İlk mesajı sen yaz!</p>
            </motion.div>
          )}
          {messages.map((msg) => renderMessage(msg))}
        </AnimatePresence>
      </div>
      
      <div className="p-6 border-t border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={currentUser ? 'Bir mesaj yaz...' : 'Giriş yapmalısınız'}
            disabled={!currentUser || loading}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 bg-white/70 dark:bg-gray-700/70 border-white/30 dark:border-gray-600/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
          />
          <Button
            onClick={handleSend}
            disabled={!currentUser || loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 rounded-xl px-6"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Wall; 