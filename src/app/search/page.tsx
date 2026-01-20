"use client";

import React, { useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, ChevronRight, Search, Map, Wallet, Building2, Users } from 'lucide-react';
import { COMPANIES, JOBS, type Job, type Company } from '@/lib/dummyData';

// Area Mapping Logic
const AREA_MAPPING: Record<string, string[]> = {
    chuyo: ['松山', '伊予', '東温', '久万高原', '松前', '砥部'],
    toyo: ['今治', '新居浜', '西条', '四国中央', '上島'],
    nanyo: ['宇和島', '八幡浜', '大洲', '西予', '内子', '伊方', '松野', '鬼北', '愛南']
};

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get('q') || '';
    const area = searchParams.get('area') || 'all';
    const industry = searchParams.get('industry') || 'all';

    // Search Logic
    const { questResults, jobResults, companyResults } = useMemo(() => {
        // Helper to check text match
        const matchText = (text?: string) => {
            if (!query) return true;
            return text?.toLowerCase().includes(query.toLowerCase());
        };

        // Helper to check area match
        const matchArea = (location?: string) => {
            if (area === 'all' || !location) return true;
            const targetCities = AREA_MAPPING[area];
            if (!targetCities) return true; // Fallback
            return targetCities.some(city => location.includes(city));
        };

        // Helper to check industry match
        const matchIndustry = (ind?: string) => {
            if (industry === 'all' || !ind) return true;
            return ind === industry;
        };

        const filteredJobsFull = JOBS.filter(job => {
            const company = COMPANIES.find(c => c.id === job.companyId);
            const matchesKeyword = matchText(job.title) || matchText(job.description) || matchText(company?.name);
            const matchesArea = matchArea(job.location) || matchArea(company?.location);
            const matchesIndustry = matchIndustry(company?.industry);

            return matchesKeyword && matchesArea && matchesIndustry;
        });

        const filteredCompanies = COMPANIES.filter(company => {
            const matchesKeyword = matchText(company.name) || matchText(company.description) || matchText(company.industry);
            const matchesArea = matchArea(company.location);
            const matchesIndustry = matchIndustry(company.industry);
            return matchesKeyword && matchesArea && matchesIndustry;
        });

        return {
            questResults: filteredJobsFull.filter(j => j.type === 'quest'),
            jobResults: filteredJobsFull.filter(j => j.type === 'job'),
            companyResults: filteredCompanies
        };
    }, [query, area, industry]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-black text-xl tracking-tighter text-slate-800 flex items-center gap-2">
                        <img src="/eis_logo_mark.png" alt="EIS" className="h-6 w-auto" />
                        Ehime Base Search
                    </Link>
                    <div className="flex items-center gap-4">
                        {/* Simple Search Display */}
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Search size={14} />
                            <span>{query || 'キーワードなし'}</span>
                            <span className="text-slate-300">|</span>
                            <span>{area === 'all' ? '全エリア' : area === 'chuyo' ? '中予' : area === 'toyo' ? '東予' : '南予'}</span>
                            <span className="text-slate-300">|</span>
                            <span>{industry === 'all' ? '全業種' : industry}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">

                {/* Page Title */}
                <div>
                    <Link href="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 text-sm font-bold mb-4 transition-colors">
                        <ArrowLeft size={16} />
                        トップに戻る
                    </Link>
                    <h1 className="text-2xl font-black mb-2">検索結果</h1>
                    <p className="text-slate-500 font-bold text-sm">
                        {questResults.length + jobResults.length + companyResults.length}件が見つかりました
                    </p>
                </div>

                {/* 1. QUESTS Section */}
                <section>
                    <SectionHeader title="クエスト" icon={Map} count={questResults.length} href={`/quests?q=${query}&area=${area}&industry=${industry}`} />
                    {questResults.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {questResults.slice(0, 4).map(quest => (
                                <QuestCard key={quest.id} quest={quest} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="条件に一致するクエストはありませんでした。" />
                    )}
                </section>

                <hr className="border-slate-200" />

                {/* 2. JOBS Section */}
                <section>
                    <SectionHeader title="求人" icon={Briefcase} count={jobResults.length} href={`/jobs?q=${query}&area=${area}&industry=${industry}`} />
                    {jobResults.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {jobResults.slice(0, 4).map(job => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="条件に一致する求人はありませんでした。" />
                    )}
                </section>

                <hr className="border-slate-200" />

                {/* 3. COMPANIES Section */}
                <section>
                    <SectionHeader title="企業" icon={Building2} count={companyResults.length} href={`/companies?q=${query}&area=${area}&industry=${industry}`} />
                    {companyResults.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {companyResults.slice(0, 4).map(comp => (
                                <CompanyCard key={comp.id} company={comp} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="条件に一致する企業はありませんでした。" />
                    )}
                </section>

            </main>
        </div>
    );
}

// --- Sub Components ---

function SectionHeader({ title, icon: Icon, count, href }: { title: string, icon: any, count: number, href: string }) {
    if (count === 0) return (
        <div className="flex items-center gap-3 mb-6 opacity-50">
            <div className="p-2 rounded-lg bg-slate-200 text-slate-500"><Icon size={20} /></div>
            <h2 className="text-xl font-black text-slate-800">{title}</h2>
            <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-xs font-black">0</span>
        </div>
    );

    return (
        <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Icon size={20} /></div>
                <h2 className="text-xl font-black text-slate-800">{title}</h2>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-black">{count}</span>
            </div>
            {count > 4 && (
                <Link href={href} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                    すべて見る <ArrowRight size={16} />
                </Link>
            )}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="bg-slate-100 rounded-xl p-8 text-center text-slate-500 font-bold text-sm">
            {message}
        </div>
    );
}

function QuestCard({ quest }: { quest: Job }) {
    const company = COMPANIES.find(c => c.id === quest.companyId);
    return (
        <Link href={`/jobs/${quest.id}`} className="block group h-full">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                <div className="relative h-48 bg-slate-100">
                    {company?.image ? (
                        <img src={company.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full ${company?.logoColor || 'bg-slate-300'}`} />
                    )}
                    <div className="absolute top-2 left-2">
                        <span className="bg-white/90 backdrop-blur text-blue-600 text-[10px] px-2 py-1 rounded font-black shadow-sm">
                            {quest.category}
                        </span>
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded overflow-hidden">
                            {company?.image ? <img src={company.image} alt="" className="w-full h-full object-cover" /> : <div className="bg-slate-300 w-full h-full"></div>}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 line-clamp-1">{company?.name}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-800 leading-tight mb-3 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                        {quest.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Wallet size={12} />
                        {quest.reward}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function JobCard({ job }: { job: Job }) {
    const company = COMPANIES.find(c => c.id === job.companyId);
    return (
        <Link href={`/jobs/${job.id}`} className="block group h-full">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                <div className="relative h-48 bg-slate-100">
                    {company?.image ? (
                        <img src={company.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full ${company?.logoColor || 'bg-slate-300'}`} />
                    )}
                    <div className="absolute top-2 left-2">
                        <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-black shadow-sm">
                            {job.category}
                        </span>
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 line-clamp-1">{job.location || company?.location}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-800 leading-tight mb-3 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                        {job.title}
                    </h3>
                    <div className="mt-auto flex flex-wrap gap-1">
                        {job.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function CompanyCard({ company }: { company: Company }) {
    return (
        <Link href={`/companies/${company.id}`} className="block group h-full">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                <div className="relative h-48 bg-slate-100">
                    {company.image ? (
                        <img src={company.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full ${company.logoColor || 'bg-slate-300'} flex items-center justify-center text-white font-black text-2xl`}>
                            {company.name.slice(0, 1)}
                        </div>
                    )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="text-[10px] font-bold text-blue-500 mb-1">{company.industry}</div>
                    <h3 className="font-black text-sm text-slate-800 leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {company.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed flex-1">
                        {company.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <MapPin size={10} />
                        {company.location}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function ArrowRight({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-blue-500">Loading...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
