import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useData';
import { supabase } from '../supabaseClient';

const Despesas: React.FC = () => {
    const { transactions, loading, refresh } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        value: '',
        category: 'Insumos',
        date: new Date().toISOString().split('T')[0]
    });

    const expenses = useMemo(() =>
        transactions.filter(t => t.type === 'Saída'),
        [transactions]);

    const totalMonthly = useMemo(() =>
        expenses.reduce((acc, curr) => acc + curr.value, 0),
        [expenses]);

    const categories = ['Insumos', 'Aluguel', 'Energia/Água', 'Marketing', 'Software', 'Equipamentos', 'Outros'];

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('transactions').insert([{
            ...newExpense,
            value: Number(newExpense.value),
            type: 'Saída',
            user_id: user.id
        }]);

        if (error) {
            alert('Erro ao registrar despesa: ' + error.message);
        } else {
            setIsModalOpen(false);
            setNewExpense({ description: '', value: '', category: 'Insumos', date: new Date().toISOString().split('T')[0] });
            refresh();
        }
        setAdding(false);
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-rose-500">
                        <span className="material-symbols-outlined font-bold">trending_down</span>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Despesas</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Gestão de custos e gastos operacionais</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined font-black">add</span>
                    <span>REGISTRAR GASTO</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 bg-rose-500/10 dark:bg-rose-900/10 p-8 rounded-[40px] border border-rose-100 dark:border-rose-900/20 flex flex-col justify-center">
                        <span className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest mb-1">Total em Despesas (Mês)</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-rose-600">R$</span>
                            <span className="text-4xl font-black text-rose-600">{totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#16212e] p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 size-20 bg-primary/5 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Diária</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white">R$ {(totalMonthly / 30).toFixed(2)}</span>
                    </div>
                    <div className="bg-white dark:bg-[#16212e] p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 size-20 bg-amber-500/5 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Maior Categoria</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white">Insumos</span>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-[#16212e] rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">Histórico de Gastos</h3>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button className="px-4 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-[10px] font-black uppercase text-primary shadow-sm">Todos</button>
                            <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-400">Este Mês</button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>
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
                                    {expenses.map((e, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5 text-sm font-medium text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{e.description}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-rose-500"></div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{e.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-sm text-rose-600">
                                                - R$ {e.value.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Nenhuma despesa registrada</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Nova Despesa */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#16212e] rounded-[40px] w-full max-w-lg p-10 shadow-2xl border border-white/20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Registrar Gasto</h3>
                        </div>

                        <form onSubmit={handleCreateExpense} className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Descrição do Gasto</label>
                                <input required placeholder="Ex: Compra de Papel Fotográfico" className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-rose-500/20" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Valor (R$)</label>
                                    <input type="number" step="0.01" required className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-black transition-all outline-none focus:ring-2 focus:ring-rose-500/20" value={newExpense.value} onChange={e => setNewExpense({ ...newExpense, value: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Data</label>
                                    <input type="date" required className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-rose-500/20" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Categoria</label>
                                <select className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-rose-500/20" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>
                                    {categories.map(cat => <option key={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-2xl text-sm font-black text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                                <button type="submit" disabled={adding} className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-black shadow-xl shadow-rose-500/30 transition-all active:scale-95">
                                    {adding ? 'SALVANDO...' : 'REGISTRAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Despesas;
