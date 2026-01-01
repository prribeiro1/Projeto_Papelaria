import React from 'react';
import { supabase } from '../supabaseClient';

const SubscriptionPage: React.FC = () => {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-6 font-sans">
            <div className="bg-white dark:bg-[#16212e] p-12 rounded-[48px] w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group text-center">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform"></div>

                <div className="flex flex-col items-center mb-10 relative z-10">
                    <div className="size-40 rounded-[40px] mb-8 bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
                        <span className="material-symbols-outlined text-7xl font-black">lock</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 italic">
                        Assinatura <span className="text-primary">Necessária</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                        Sua conta no <span className="font-bold text-primary">PROATIVX</span> está ativa, mas você ainda não possui um plano de assinatura vinculado.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative z-10">
                    <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 group/card hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="material-symbols-outlined">whatsapp</span>
                        </div>
                        <h3 className="font-black text-slate-800 dark:text-white">Falar com Suporte</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ativação Instantânea</p>
                        <a href="#" className="mt-2 w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest transition-all">
                            ABRIR CONVERSA
                        </a>
                    </div>

                    <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 group/card hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">credit_card</span>
                        </div>
                        <h3 className="font-black text-slate-800 dark:text-white">Ver Planos</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Renovação Automática</p>
                        <button className="mt-2 w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest transition-all">
                            CONHECER PLANOS
                        </button>
                    </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        SAIR DA CONTA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
