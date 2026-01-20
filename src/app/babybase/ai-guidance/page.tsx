"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Send, ArrowLeft, MessageCircle, Sparkles,
    ChevronRight, Baby, Heart, Shield, RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
    actions?: { label: string, href: string }[];
}

export default function AIGuidance() {
    const { bbSpecialists } = useAppStore();
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
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulated AI response logic
        setTimeout(() => {
            const lowerInput = input.toLowerCase();
            let responseText = "お話ありがとうございます。そのお悩みであれば、こちらの専門家が力添えできるかもしれません。";
            let suggestedActions: { label: string, href: string }[] = [];

            if (lowerInput.includes('乳') || lowerInput.includes('ミルク') || lowerInput.includes('産後')) {
                const midwife = bbSpecialists.find(s => s.category === '妊娠・出産');
                responseText = `母乳や産後の体調のお悩みですね。助産師の${midwife?.name}さんに相談してみるのはいかがでしょうか？`;
                suggestedActions = [{ label: `${midwife?.name}さんのプロフィール`, href: `/babybase/specialists/${midwife?.id}` }];
            } else if (lowerInput.includes('寝ない') || lowerInput.includes('夜泣き') || lowerInput.includes('ねんね')) {
                const sleep = bbSpecialists.find(s => s.category === '赤ちゃん・育児' && s.tags.includes('夜泣き'));
                responseText = `寝かしつけや夜泣きは体力的にも大変ですよね。ねんねコンサルタントの${sleep?.name}さんが専門的な知識を持っています。`;
                suggestedActions = [{ label: `${sleep?.name}さんの詳細を見る`, href: `/babybase/specialists/${sleep?.id}` }];
            } else if (lowerInput.includes('離乳食') || lowerInput.includes('食べない') || lowerInput.includes('栄養')) {
                const nut = bbSpecialists.find(s => s.category === '離乳食・健康');
                responseText = `離乳食の進め方や偏食、心配になりますよね。栄養士の${nut?.name}さんがレシピ作成などのサポートを行っています。`;
                suggestedActions = [{ label: `${nut?.name}さんに相談`, href: `/babybase/specialists/${nut?.id}` }];
            } else {
                responseText = "育児の悩みは尽きないですよね。まずは、お近くの助産師さんや、子育て相談の専門家に今の気持ちを話してみるのが良いかもしれません。";
                suggestedActions = [{ label: "専門家一覧を見る", href: "/babybase/specialists" }];
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'ai',
                timestamp: Date.now(),
                actions: suggestedActions
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="h-screen bg-[#FFFBF0] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-6 bg-white border-b border-pink-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/babybase" className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight">AI案内所</h1>
                        <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Guidance Concierge</p>
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
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] space-y-4`}>
                                <div className={`px-5 py-4 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                    : 'bg-white text-slate-700 rounded-tl-none border border-pink-50'
                                    }`}>
                                    {msg.text}
                                </div>

                                {msg.actions && (
                                    <div className="space-y-2">
                                        {msg.actions.map(action => (
                                            <Link key={action.label} href={action.href} className="inline-flex items-center gap-2 bg-pink-500 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all group">
                                                {action.label}
                                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white border border-pink-50 px-4 py-2 rounded-2xl flex gap-1">
                                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-pink-50 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="（例）寝かしつけが大変で困っています..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="w-full bg-slate-50 border-none rounded-[2rem] py-5 pl-6 pr-16 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-200 active:scale-95 transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => setInput('離乳食について')} className="px-3 py-1 bg-pink-50 rounded-full text-[10px] font-black text-pink-500 border border-pink-100 italic">#離乳食</button>
                    <button onClick={() => setInput('夜泣きがひどい')} className="px-3 py-1 bg-pink-50 rounded-full text-[10px] font-black text-pink-500 border border-pink-100 italic">#夜泣き</button>
                    <button onClick={() => setInput('骨盤矯正したい')} className="px-3 py-1 bg-pink-50 rounded-full text-[10px] font-black text-pink-500 border border-pink-100 italic">#産後ケア</button>
                </div>
            </div>
        </div>
    );
}
