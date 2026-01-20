"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Send, ArrowLeft, MessageCircle, Sparkles,
    ChevronRight, Baby, Heart, Shield, RefreshCcw,
    User, BookOpen, Star, Calendar, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Recommendation {
    type: 'specialist' | 'article' | 'post';
    id: string;
    title: string;
    description: string;
    image: string;
    category?: string;
    href: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
    actions?: { label: string, href: string }[];
    recommendations?: Recommendation[];
}

export default function AIGuidance() {
    const { bbSpecialists, bbArticles, bbPosts } = useAppStore();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'こんにちは！Baby Base AI案内所です。育児のお悩みや、誰に相談したらいいかわからないことを教えてください。',
            sender: 'ai',
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/babybase/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages,
                    specialists: bbSpecialists,
                    articles: bbArticles,
                    posts: bbPosts
                })
            });

            if (!response.ok) throw new Error('AI Analysis failed');
            const data = await response.json();

            // Map IDs back to full objects
            const recs: Recommendation[] = data.recommendations.map((r: any) => {
                if (r.type === 'specialist') {
                    const s = bbSpecialists.find(spec => spec.id === r.id);
                    return s ? { type: 'specialist', id: s.id, title: `${s.name}先生`, description: s.description, image: s.image, category: s.category, href: `/babybase/specialists/${s.id}` } : null;
                } else if (r.type === 'article') {
                    const a = bbArticles.find(art => art.id === r.id);
                    return a ? { type: 'article', id: a.id, title: a.title, description: "役立つ知識を読む", image: a.image, category: a.category, href: `/babybase/learning/${a.id}` } : null;
                } else if (r.type === 'post') {
                    const p = bbPosts.find(post => post.id === r.id);
                    return p ? { type: 'post', id: p.id, title: "最新の投稿", description: p.content.slice(0, 30), image: p.image || '', href: `/babybase/search?q=${encodeURIComponent(input)}` } : null;
                }
                return null;
            }).filter(Boolean);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.responseText,
                sender: 'ai',
                timestamp: Date.now(),
                recommendations: recs
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: '申し訳ありません。現在AI案内所が混み合っております。少し時間を置いて再度お試しいただくか、専門家一覧より直接お探しください。',
                sender: 'ai',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-screen bg-[#FFFBF0] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-6 bg-white border-b border-pink-50 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/babybase" className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight">AI案内所</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Concierge</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([messages[0]])}
                    className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-pink-500 transition-colors"
                >
                    <RefreshCcw size={18} />
                </button>
            </header>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[90%] md:max-w-[80%] space-y-3`}>
                                <div className={`px-5 py-4 rounded-[2.5rem] text-sm font-bold leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                    : 'bg-white text-slate-700 rounded-tl-none border border-pink-50'
                                    }`}>
                                    {msg.text}
                                </div>

                                {msg.recommendations && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white rounded-[2rem] border-2 border-pink-100 p-4 shadow-xl shadow-pink-100/50 space-y-3"
                                    >
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-pink-50">
                                            <div className="p-1.5 bg-pink-100 rounded-lg text-pink-500">
                                                <Sparkles size={16} fill="currentColor" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">あなたへのおすすめガイド</span>
                                        </div>

                                        <div className="space-y-3">
                                            {msg.recommendations.map(reco => (
                                                <Link key={reco.id} href={reco.href} className="flex gap-3 p-2 rounded-2xl hover:bg-pink-50 transition-colors group">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                                        <img src={reco.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            {reco.type === 'specialist' ? <User size={10} className="text-pink-400" /> : <BookOpen size={10} className="text-blue-400" />}
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{reco.category}</span>
                                                        </div>
                                                        <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-pink-500 transition-colors">{reco.title}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 line-clamp-1 mt-0.5">{reco.description}</p>
                                                    </div>
                                                    <div className="self-center p-1.5 rounded-full bg-slate-50 text-slate-300 group-hover:bg-pink-500 group-hover:text-white transition-all">
                                                        <ArrowUpRight size={14} />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <Link href="/babybase/specialists" className="block text-center py-2 text-[10px] font-black text-pink-500 hover:text-pink-600 transition-colors border-t border-pink-50 mt-2 pt-2">
                                            すべての専門家を見る
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white border border-pink-50 px-5 py-3 rounded-[2rem] flex items-center gap-2">
                                <div className="flex gap-1">
                                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">AIが情報を整理しています...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white border-t border-pink-50 flex-shrink-0">
                <div className="max-w-3xl mx-auto w-full relative">
                    <input
                        type="text"
                        placeholder="（例）寝かしつけが大変で困っています..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isComposing) {
                                handleSend();
                            }
                        }}
                        className="w-full bg-slate-50 border-none rounded-[2.5rem] py-5 pl-8 pr-16 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all shadow-inner"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-200 active:scale-95 transition-all z-10"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button onClick={() => setInput('離乳食について')} className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black text-pink-500 border border-pink-100 shadow-sm hover:bg-pink-50 transition-colors"># 離乳食のお悩み</button>
                    <button onClick={() => setInput('夜泣きがひどい')} className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black text-pink-500 border border-pink-100 shadow-sm hover:bg-pink-50 transition-colors"># 夜泣き・寝かしつけ</button>
                    <button onClick={() => setInput('骨盤矯正したい')} className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black text-pink-500 border border-pink-100 shadow-sm hover:bg-pink-50 transition-colors"># 産後・ボティケア</button>
                </div>
            </div>
        </div>
    );
}
