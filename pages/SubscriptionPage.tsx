import React from 'react';
import { supabase } from '../supabaseClient';

const SubscriptionPage: React.FC = () => {
    const [showPlans, setShowPlans] = React.useState(false);
    const [userId, setUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const getStripeUrl = (priceId: string) => {
        // Stripe Payment Links for PROATIVX
        const baseUrl = priceId === 'price_1Skn4hLY4Lc1mlrLLB0doYYq'
            ? 'https://buy.stripe.com/bJe5kE8a0enY6Ts3lzbwk04'
            : 'https://buy.stripe.com/aFaeVegGwa7Ib9I8FTbwk05';

        return `${baseUrl}?client_reference_id=${userId}`;
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-6 font-sans">
            <div className={`bg-white dark:bg-[#16212e] p-12 rounded-[48px] w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group text-center transition-all duration-500 ${showPlans ? 'scale-95 opacity-50 blur-sm pointer-events-none' : ''}`}>
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
                        <a
                            href="https://wa.me/5522999298128?text=Olá! Gostaria de ativar minha assinatura no PROATIVX."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest transition-all text-center"
                        >
                            ABRIR CONVERSA
                        </a>
                    </div>

                    <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 group/card hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">credit_card</span>
                        </div>
                        <h3 className="font-black text-slate-800 dark:text-white">Ver Planos</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Renovação Automática</p>
                        <button
                            onClick={() => setShowPlans(true)}
                            className="mt-2 w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest transition-all"
                        >
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

            {/* Plans Modal */}
            {showPlans && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <div className="absolute inset-0 bg-background-dark/40 backdrop-blur-sm" onClick={() => setShowPlans(false)}></div>
                    <div className="bg-white dark:bg-[#16212e] w-full max-w-4xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row">
                        <div className="p-12 flex-1">
                            <button
                                onClick={() => setShowPlans(false)}
                                className="absolute top-8 left-8 size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>

                            <div className="mt-8 mb-10">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white italic mb-2">Planos <span className="text-primary">PROATIVX</span></h1>
                                <p className="text-sm text-slate-500 font-medium">Escolha a melhor opção para o seu negócio</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    'Gestão Completa de Pedidos',
                                    'Financeiro e Controle de Caixa',
                                    'Backup e Exportação de Dados',
                                    'Suporte Prioritário Via WhatsApp',
                                    'Acesso em Múltiplos Dispositivos'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="size-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm font-black">check</span>
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-12 w-full md:w-96 flex flex-col gap-6">
                            {/* Monthly Plan */}
                            <a
                                href={getStripeUrl('price_1Skn4hLY4Lc1mlrLLB0doYYq')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-6 rounded-3xl bg-white dark:bg-[#16212e] border-2 border-transparent hover:border-primary transition-all group/plan cursor-pointer block"
                            >
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mensal</span>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">R$ 14,90</span>
                                    <span className="text-xs text-slate-400 font-bold">/mês</span>
                                </div>
                                <div className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover/plan:bg-primary group-hover/plan:text-white text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all text-center">
                                    ASSINAR MENSAL
                                </div>
                            </a>

                            {/* Annual Plan */}
                            <a
                                href={getStripeUrl('price_1Skn5BLY4Lc1mlrLSgjcVW2w')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-6 rounded-3xl bg-white dark:bg-[#16212e] border-2 border-primary relative group/plan cursor-pointer shadow-xl shadow-primary/10 block"
                            >
                                <div className="absolute -top-3 right-6 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">ECONOMIZE 20%</div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Anual</span>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">R$ 149</span>
                                    <span className="text-xs text-slate-400 font-bold">/ano</span>
                                </div>
                                <div className="w-full py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest transition-all text-center">
                                    ASSINAR ANUAL
                                </div>
                            </a>

                            <p className="text-[9px] text-slate-400 font-medium text-center uppercase tracking-tighter">Cancelamento facilitado a qualquer momento</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
