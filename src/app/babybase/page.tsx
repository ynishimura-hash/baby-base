"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Heart, Sparkles, MessageCircle, BookOpen,
    Calendar, Users, ChevronRight, Search,
    Baby, Star, Info, Layout, Bell, Menu,
    TrendingUp, MessageSquare, Camera, Play,
    Smile, Coffee, Home, Send, ThumbsUp, Shrink
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function BabyBaseTop() {
    const { bbSpecialists, bbEvents, bbArticles, bbPosts, momProfile } = useAppStore();

    // AI Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'こんにちは！育児のお悩み、何でも聞かせてくださいね。ぴったりの専門家をご案内します。' }
    ]);
    const [isComposing, setIsComposing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [chatMessages]);

    const [isTyping, setIsTyping] = useState(false);

    const handleSendChat = async () => {
        if (!chatInput.trim() || isTyping) return;
        const userMsgText = chatInput;
        const userMsg = { role: 'user' as const, text: userMsgText };

        const updatedMessages = [...chatMessages, userMsg];
        setChatMessages(updatedMessages);
        setChatInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/babybase/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ text: m.text, sender: m.role === 'user' ? 'user' : 'ai' })),
                    specialists: bbSpecialists,
                    articles: bbArticles,
                    posts: bbPosts
                })
            });

            if (!response.ok) throw new Error('AI Analysis failed');
            const data = await response.json();

            setChatMessages(prev => [...prev, { role: 'ai', text: data.responseText }]);
        } catch (error) {
            console.error('Top Chat Error:', error);
            setChatMessages(prev => [...prev, { role: 'ai', text: '申し訳ありません。現在案内所が混み合っております。少し時間を置いて再度お試しください。' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const trendingWords = ['離乳食の進め方', '夜泣き対策', '保活2026', '産後ケア', '愛媛おでかけ'];

    return (
        <div className="min-h-screen bg-white text-slate-700 selection:bg-pink-100 pb-32 overflow-x-hidden">
            {/* Top Bar / Branding */}
            <div className="bg-[#FF7BB3] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-[60] shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#FF7BB3] shadow-inner">
                        <Baby size={22} />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter">Baby Base</h1>
                </div>
                <div className="flex items-center gap-5">
                    <Search size={22} className="opacity-90 hover:opacity-100 cursor-pointer transition-opacity" />
                    <Bell size={22} className="opacity-90 hover:opacity-100 cursor-pointer transition-opacity" />
                    <Menu size={22} className="opacity-90 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>
            </div>

            {/* Trending Section */}
            <div className="bg-[#FFF5F8] px-6 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none border-b border-pink-100 sticky top-[52px] z-[50]">
                <span className="bg-pink-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm leading-none shrink-0 uppercase">Trending</span>
                {trendingWords.map(word => (
                    <Link key={word} href={`/babybase/search?q=${word}`} className="text-xs font-bold text-pink-600 whitespace-nowrap bg-white px-4 py-1.5 rounded-full border border-pink-100 shadow-sm hover:border-pink-300 transition-colors">
                        #{word}
                    </Link>
                ))}
            </div>

            <main className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-8">
                {/* 
                   Section 1: Top Area
                   Full width container split into Hero (Left) and AI Chat (Right).
                   Timeline is NOT here, allowing these to expand.
                */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Hero Section (3/5 width) */}
                    <div className="lg:col-span-3 relative h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl group">
                        <img
                            src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1200&auto=format&fit=crop"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt="Featured"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <span className="bg-[#FFCC00] text-black text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-widest mb-4 inline-block">Special Feature</span>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight drop-shadow-lg">
                                愛媛のママが選ぶ「本当に助かった」<br className="hidden md:block" />産後ケア専門家ベスト5
                            </h2>
                            <div className="mt-6 flex gap-2">
                                {[1, 2, 3, 4].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === 1 ? 'w-12 bg-white' : 'w-2.5 bg-white/30'}`} />)}
                            </div>
                        </div>
                    </div>

                    {/* Inline AI Chat (2/5 width - Wider now) */}
                    <div className="lg:col-span-2 bg-[#FFF8FA] rounded-[2.5rem] border-2 border-pink-100 shadow-xl overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-white px-8 py-5 border-b border-pink-50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 leading-tight tracking-tight">AI お悩み相談室</h3>
                                    <p className="text-xs font-bold text-pink-400 mt-1">24時間いつでも専門の知識でサポートします</p>
                                </div>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-pink-100 bg-gradient-to-b from-white to-[#FFF8FA]">
                            {chatMessages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-sm font-bold shadow-md ${msg.role === 'user'
                                        ? 'bg-pink-500 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 rounded-tl-none border border-pink-50'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Consultation Redirect Button */}
                            {chatInput && !isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex justify-center mt-4"
                                >
                                    <Link
                                        href={`/babybase/ai-guidance?q=${encodeURIComponent(chatInput)}`}
                                        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-black text-sm shadow-xl shadow-pink-200 flex items-center gap-2 hover:scale-105 transition-transform animate-pulse"
                                    >
                                        <Sparkles size={16} />
                                        AI案内所で詳しく相談する
                                        <ChevronRight size={16} />
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-5 bg-white border-t border-pink-50 shrink-0">
                            <div className="relative flex items-center gap-3">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onCompositionStart={() => setIsComposing(true)}
                                    onCompositionEnd={() => setIsComposing(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isComposing) {
                                            // Prevent default Enter behavior to keep input focused and show button
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder="今の悩みをお聞かせください..."
                                    className="flex-1 bg-slate-50 border-none rounded-[1.5rem] py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-pink-100 shadow-inner placeholder:text-slate-300"
                                />
                                <Link
                                    href={`/babybase/ai-guidance?q=${encodeURIComponent(chatInput)}`}
                                    className={`w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 transition-all ${!chatInput.trim() ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <Send size={22} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 
                   Section 2: Main Content Split
                   Left: Categories and Content
                   Right: Timeline (Now aligned with Categories)
                */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column (Content) - 3/4 Width */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* Categories Grid - Timeline Top Aligns Here */}
                        <div>
                            <div className="flex items-center gap-2 border-l-4 border-pink-500 pl-3 mb-6">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">お悩み・相談カテゴリ</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Boards</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: '妊娠・出産', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                                    { label: '赤ちゃん・育児', icon: Baby, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { label: '離乳食・健康', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                                    { label: '夫婦・家庭', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { label: '保活・自分', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                    { label: 'おでかけ・お店', icon: Camera, color: 'text-purple-500', bg: 'bg-purple-50' },
                                    { label: 'リラックス', icon: Coffee, color: 'text-amber-700', bg: 'bg-stone-50' },
                                    { label: 'すべて', icon: Layout, color: 'text-slate-500', bg: 'bg-slate-50' },
                                ].map((cat) => (
                                    <Link key={cat.label} href={`/babybase/search?cat=${cat.label}`} className={`${cat.bg} p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:scale-[1.03] transition-transform shadow-sm group border border-transparent hover:border-white shadow-pink-50/50`}>
                                        <cat.icon size={32} className={cat.color} />
                                        <span className="text-xs font-black text-slate-700">{cat.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Articles & Events */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Articles Column */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <BookOpen className="text-pink-500" size={24} /> 最新のノウハウ
                                    </h3>
                                    <Link href="/babybase/learning" className="text-xs font-bold text-slate-400">すべて見る</Link>
                                </div>
                                <div className="space-y-4">
                                    {bbArticles.slice(0, 3).map((article) => (
                                        <Link key={article.id} href={`/babybase/learning/${article.id}`} className="flex gap-4 group">
                                            <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-sm">
                                                <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[9px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded inline-block w-fit mb-1">{article.category}</span>
                                                <h4 className="font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors">
                                                    {article.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">{article.publishedAt}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Events Column */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Calendar className="text-indigo-500" size={24} /> イベント案内
                                    </h3>
                                    <Link href="/babybase/events" className="text-xs font-bold text-slate-400">すべて見る</Link>
                                </div>
                                <div className="space-y-4">
                                    {bbEvents.slice(0, 3).map((event) => (
                                        <Link key={event.id} href={`/babybase/events/${event.id}`} className="flex gap-4 group">
                                            <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-sm border border-slate-50">
                                                <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-500 transition-colors">
                                                    {event.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                                    <Calendar size={10} /> {event.date}
                                                </p>
                                                <div className="text-[10px] font-black text-indigo-500 mt-1">
                                                    詳細をチェック
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Timeline - 1/4 Width */}
                    {/* Aligned with the Categories section naturally by grid flow */}
                    <aside className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24 max-h-[calc(100vh-120px)] flex flex-col pt-2">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic mb-5 shrink-0 px-1">
                                <MessageSquare className="text-indigo-500" size={26} /> TIMELINE
                            </h3>
                            <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-5 scrollbar-thin scrollbar-thumb-indigo-50">
                                {bbPosts.map((post, idx) => {
                                    const spec = bbSpecialists.find(s => s.id === post.specialistId);
                                    return (
                                        <article key={post.id} className="bg-white rounded-[1.8rem] p-4 shadow-md border border-slate-100/80 space-y-3 hover:shadow-lg transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 shrink-0">
                                                    <img src={spec?.image} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 leading-none">{spec?.name} 先生</p>
                                                    <p className="text-[9px] font-bold text-slate-400 lowercase mt-0.5">{post.createdAt.split(' ')[1]}</p>
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                                                {post.content}
                                            </p>
                                            {post.image && (
                                                <div className="rounded-xl overflow-hidden aspect-[4/3] shadow-inner">
                                                    <img src={post.image} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-5 text-slate-300 pt-1">
                                                <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                                                    <ThumbsUp size={14} />
                                                    <span className="text-[10px] font-black">{post.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                                                    <MessageCircle size={14} />
                                                    <span className="text-[10px] font-black">2</span>
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Bottom Registration CTA */}
                {!momProfile && (
                    <section className="bg-gradient-to-r from-[#FF7BB3] to-[#FF9EBD] py-20 px-6 text-center text-white space-y-8 mt-16 rounded-[3rem] mx-4 mb-24 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -ml-32 -mb-32" />

                        <div className="w-32 h-32 bg-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-md border border-white/30 transform hover:rotate-12 transition-transform cursor-pointer">
                            <Baby size={60} className="text-white drop-shadow-lg" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter drop-shadow-md">BECOME A MEMBER</h2>
                        <p className="text-base md:text-xl font-bold opacity-90 leading-relaxed max-w-xl mx-auto drop-shadow-sm">
                            愛媛のママのための、世界に一つだけの居場所。<br className="hidden md:block" />
                            お子様の成長に合わせて、最高の専門家たちが寄り添います。
                        </p>
                        <Link href="/babybase/register" className="inline-block bg-white text-[#FF7BB3] px-16 py-6 rounded-full font-black text-lg shadow-2xl hover:bg-pink-50 active:scale-95 transition-all outline-none focus:ring-8 focus:ring-white/20 transform hover:-translate-y-1">
                            今すぐ無料で始める
                        </Link>
                    </section>
                )}
            </main>

            {/* Float Navigation */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl border border-white/60 px-10 py-5 rounded-[2.5rem] shadow-2xl z-[100] flex items-center gap-12 ring-1 ring-black/5">
                <Link href="/babybase" className="flex flex-col items-center gap-1.5 text-pink-500 group">
                    <Home size={26} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7BB3]">Top</span>
                </Link>
                <Link href="/babybase/specialists" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-pink-500 transition-all group">
                    <Users size={26} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Experts</span>
                </Link>
                <Link href="/babybase/learning" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-pink-500 transition-all group">
                    <BookOpen size={26} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Learn</span>
                </Link>
                <Link href="/babybase/mypage" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-pink-500 transition-all group">
                    <Smile size={26} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">My</span>
                </Link>
            </nav>

            {/* Global Footer */}
            <footer className="bg-slate-900 text-white pt-24 pb-48 px-6 text-center space-y-12">
                <div className="flex justify-center items-center gap-4">
                    <div className="w-12 h-12 bg-pink-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                        <Baby size={28} />
                    </div>
                    <span className="text-3xl font-black tracking-tighter uppercase italic">Baby Base</span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-xs font-black text-slate-500 uppercase tracking-widest border-y border-white/5 py-10">
                    <Link href="#" className="hover:text-pink-400 transition-colors">About Project</Link>
                    <Link href="#" className="hover:text-pink-400 transition-colors">Terms of Use</Link>
                    <Link href="#" className="hover:text-pink-400 transition-colors">Safety Guide</Link>
                    <Link href="#" className="hover:text-pink-400 transition-colors">Collaborate</Link>
                    <Link href="#" className="hover:text-pink-400 transition-colors">Inquiry</Link>
                </div>
                <p className="text-[11px] font-bold text-slate-600 max-w-sm mx-auto leading-relaxed opacity-80">
                    © 2026 Baby Base. Designed with love in Ehime.<br />
                    すべての家族が笑顔で過ごせる未来を、テクノロジーと専門家の知恵で創ります。
                </p>
            </footer>
        </div>
    );
}
