import React, { useMemo } from 'react';
import { useTransactions, useDashboardStats } from '../hooks/useData';

const Financeiro: React.FC = () => {
    const { transactions, loading: loadingTrans } = useTransactions();
    const { stats, loading: loadingStats } = useDashboardStats();

    const paymentMethods = [
        { label: 'Pix', value: 0, icon: 'account_balance', color: 'bg-emerald-500' },
        { label: 'Cartão de Crédito', value: 0, icon: 'credit_card', color: 'bg-blue-500' },
        { label: 'Dinheiro', value: 0, icon: 'payments', color: 'bg-amber-500' },
    ];

    // In a real scenario, we'd filter transactions by payment method
    // For now, let's distribute roughly for UI demonstration
    const faturamentoTotal = stats.faturamento;
    paymentMethods[0].value = faturamentoTotal * 0.6;
    paymentMethods[1].value = faturamentoTotal * 0.3;
    paymentMethods[2].value = faturamentoTotal * 0.1;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financeiro</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Controle de caixa, entradas e saídas</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span> Nova Entrada
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">remove</span> Nova Saída
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                {/* Payment Methods Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {paymentMethods.map((method, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#16212e] p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 size-24 ${method.color} opacity-5 -mr-8 -mt-8 rounded-full group-hover:scale-110 transition-transform`}></div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`size-10 rounded-2xl ${method.color} flex items-center justify-center text-white shadow-lg`}>
                                    <span className="material-symbols-outlined">{method.icon}</span>
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{method.label}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">R$ {method.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span className="text-[10px] text-emerald-500 font-bold mt-1">+12% vs mês anterior</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cash Flow Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#16212e] p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">Fluxo de Caixa</h3>
                            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 outline-none">
                                <option>Últimos 30 dias</option>
                                <option>Últimos 7 dias</option>
                                <option>Este ano</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 h-48">
                            {/* Simple Bar Chart Placeholder */}
                            {[40, 65, 45, 90, 55, 75, 60, 85, 40, 70, 50, 65].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative overflow-hidden flex items-end" style={{ height: '100%' }}>
                                        <div className="w-full bg-primary/20 group-hover:bg-primary/40 transition-all rounded-t-lg" style={{ height: `${h}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#16212e] p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">Resumo Mensal</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Recebido</span>
                                    </div>
                                    <span className="text-lg font-black text-emerald-600">R$ {stats.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-rose-500">trending_down</span>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Pago</span>
                                    </div>
                                    <span className="text-lg font-black text-rose-600">R$ {stats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">balance</span>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Saldo Líquido</span>
                                    </div>
                                    <span className="text-lg font-black text-primary">R$ {(stats.faturamento - stats.despesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-[#16212e] rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">Últimas Transações</h3>
                        <button className="text-xs font-black text-primary hover:underline">Ver TUDO</button>
                    </div>
                    {loadingTrans ? (
                        <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-8 py-4">Data</th>
                                        <th className="px-8 py-4">Descrição</th>
                                        <th className="px-8 py-4">Categoria</th>
                                        <th className="px-8 py-4 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5 text-sm font-medium text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-8 rounded-full flex items-center justify-center ${t.type === 'Entrada' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        <span className="material-symbols-outlined text-sm">{t.type === 'Entrada' ? 'south_west' : 'north_east'}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{t.category}</span>
                                            </td>
                                            <td className={`px-8 py-5 text-right font-black text-sm ${t.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'Entrada' ? '+' : '-'} R$ {t.value.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Financeiro;
