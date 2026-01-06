import React, { useState, useMemo } from 'react';
import { useTransactions, useOrders, useCompanySettings } from '../hooks/useData';
import { supabase } from '../supabaseClient';
import SalesGoal from '../components/SalesGoal';

const Metas: React.FC = () => {
    const { settings, refresh: refreshSettings } = useCompanySettings();

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-violet-600">
                        <span className="material-symbols-outlined font-black text-3xl">flag</span>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Metas Mensais</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Acompanhe seu desempenho e alcance seus objetivos</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {/* The SalesGoal component already contains the logic and UI using platform colors */}
                    {/* We will wrap it in a nice container or just render it directly if it's already styled well */}
                    <div className="bg-white dark:bg-[#16212e] rounded-[40px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500">calendar_month</span>
                            Visão Geral do Mês
                        </h2>
                        <SalesGoal initialGoal={settings?.monthly_goal} onUpdate={refreshSettings} />
                    </div>

                    {/* Future: Add more metrics here like "Daily Goal", "Yearly Goal", etc. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="p-8 rounded-[40px] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                            <div className="flex items-center gap-3 mb-4 text-indigo-600 dark:text-indigo-400">
                                <span className="material-symbols-outlined text-2xl">trending_up</span>
                                <h3 className="font-black text-lg">Dica de Crescimento</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                                Manter uma meta clara ajuda a focar nos resultados. Tente aumentar sua meta em 10% todo mês para um crescimento sustentável!
                            </p>
                        </div>
                        <div className="p-8 rounded-[40px] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                            <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                                <h3 className="font-black text-lg">Objetivos Concluídos</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                                Registre aqui suas conquistas. (Funcionalidade em breve)
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Metas;
