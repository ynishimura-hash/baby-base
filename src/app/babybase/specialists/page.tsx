"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Search, MapPin, Star, Heart,
    ArrowLeft, Filter, ChevronRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecialistCategory } from '@/lib/types/babybase';

export default function SpecialistDirectory() {
    const { bbSpecialists } = useAppStore();
    const [selectedCategory, setSelectedCategory] = useState<SpecialistCategory | 'すべて'>('すべて');
    const [searchQuery, setSearchQuery] = useState('');

    const categories: (SpecialistCategory | 'すべて')[] = [
        'すべて', '妊娠・出産', '赤ちゃん・育児', '離乳食・健康', '夫婦・家庭', '保活・自分', 'おでかけ・お店', 'リラックス'
    ];

    const filteredSpecialists = bbSpecialists.filter(s => {
        const matchesCat = selectedCategory === 'すべて' || s.category === selectedCategory;
        const matchesSearch = s.name.includes(searchQuery) || s.description.includes(searchQuery) || s.tags.some(t => t.includes(searchQuery));
        return matchesCat && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#FFFBF0] pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-50 px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/babybase" className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">専門家・講師を探す</h1>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="お悩みや専門知識で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                </div>
            </header>

            <main className="p-6 space-y-8">
                {/* Category Pills */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border ${selectedCategory === cat
                                ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-pink-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Specialist Grid */}
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filteredSpecialists.map((spec, idx) => (
                            <motion.div
                                key={spec.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-6 relative overflow-hidden group"
                            >
                                <div className="flex gap-6">
                                    <div className="relative flex-shrink-0">
                                        <img src={spec.image} className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-pink-50" alt="" />
                                        {spec.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                                                <CheckCircle2 size={16} className="text-blue-500" fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{spec.category}</span>
                                                <h3 className="text-lg font-black text-slate-800 leading-tight">{spec.name}</h3>
                                            </div>
                                            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-pink-500 transition-colors">
                                                <Heart size={20} />
                                            </button>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed line-clamp-2">
                                            {spec.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {spec.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[9px] font-black border border-slate-100 uppercase tracking-widest">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
                                            <MapPin size={14} className="text-pink-400" />
                                            {spec.location}
                                        </div>
                                        <Link href={`/babybase/specialists/${spec.id}`} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] flex items-center gap-2 group-hover:bg-pink-500 transition-colors">
                                            プロフィールを見る
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredSpecialists.length === 0 && (
                        <div className="text-center py-20 animate-in fade-in zoom-in">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 text-slate-300">
                                <Filter size={32} />
                            </div>
                            <h3 className="text-slate-800 font-black">条件に合う専門家が見つかりませんでした</h3>
                            <p className="text-xs text-slate-400 font-bold mt-1">キーワードを変えて再検索してみてください</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
