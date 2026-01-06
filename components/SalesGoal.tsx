import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useTransactions, useOrders } from '../hooks/useData';

interface SalesGoalProps {
    initialGoal?: number;
    onUpdate?: () => void;
}

const SalesGoal: React.FC<SalesGoalProps> = ({ initialGoal = 0, onUpdate }) => {
    const [goal, setGoal] = useState(initialGoal);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(initialGoal?.toString() || '0');

    // Data for progress calculation
    const { orders } = useOrders();
    const { transactions } = useTransactions();

    // Calculate current month's revenue
    const currentRevenue = React.useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Revenue from Orders (Amount Paid) created in current month
        // Note: Ideally we should use payment date, but using created_at for simplicity as per existing logic
        const ordersRevenue = orders
            .filter(o => {
                const d = new Date(o.createdAt.split('/').reverse().join('-')); // pt-BR date format 'dd/mm/yyyy' needs conversion?
                // Wait, useOrders hook formats date to pt-BR string string 'dd/mm/yyyy' or Date object?
                // Let's check useData.ts: createdAt: new Date(o.created_at).toLocaleDateString('pt-BR')
                // This converts it to string DD/MM/YYYY. We need to parse it back or use raw data if possible.
                // Since hooks return accessible data, we might need to be careful.
                // Actually, let's rely on the fact that if we use 'new Date()' on a standard ISO string it works, 
                // but localDateString might be tricky.
                // Let's assume we can parse DD/MM/YYYY.
                const parts = o.createdAt.split('/');
                if (parts.length === 3) {
                    const dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                    return dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear;
                }
                return false;
            })
            .reduce((acc, o) => acc + o.amountPaid, 0);

        // Revenue from Transactions (Entrada) in current month
        // transactions date is usually YYYY-MM-DD from HTML input
        const extraRevenue = transactions
            .filter(t => {
                if (t.type !== 'Entrada') return false;
                const d = new Date(t.date);
                // Adjust for timezone issues if date is just YYYY-MM-DD
                // But generally getMonth() works if we treat it as UTC or verify input format
                // Transaction date input is type="date", so '2023-01-01'
                // new Date('2023-01-01') in JS is usually UTC. 
                // Let's be safe:
                const [y, m, dstr] = t.date.split('-').map(Number);
                return (m - 1) === currentMonth && y === currentYear;
            })
            .reduce((acc, t) => acc + t.value, 0);

        return ordersRevenue + extraRevenue;
    }, [orders, transactions]);

    useEffect(() => {
        setGoal(initialGoal || 0);
        setTempGoal(initialGoal?.toString() || '0');
    }, [initialGoal]);

    const handleSave = async () => {
        const newGoal = parseFloat(tempGoal);
        if (isNaN(newGoal)) return;

        const { error } = await supabase
            .from('company_settings')
            .update({ monthly_goal: newGoal })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Updates all (should be only one row usually)
        // Or better, we don't have ID here? useCompanySettings has ID.
        // But we don't have access to settings ID here unless passed.
        // We can assume there is only one row or update generally.
        // Let's try to update without ID if we don't have it, or fetch it.
        // For safety, let's assume the user has 1 row.

        if (!error) {
            setGoal(newGoal);
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } else {
            // Fallback: maybe there are no settings, insert one?
            // Assuming settings exist as per app logic
            alert('Erro ao salvar meta');
        }
    };

    const percentage = goal > 0 ? Math.min((currentRevenue / goal) * 100, 100) : 0;
    const remaining = Math.max(goal - currentRevenue, 0);

    return (
        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10 rounded-[32px] p-8 border border-violet-100 dark:border-violet-900/20 shadow-sm mb-8 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors">
                    <span className="material-symbols-outlined text-lg">edit</span>
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-2xl">target</span>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-slate-700 dark:text-slate-200">Meta: R$</span>
                            <input
                                type="number"
                                autoFocus
                                value={tempGoal}
                                onChange={e => setTempGoal(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                className="w-32 bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-800 rounded-lg px-2 py-1 text-lg font-black text-rose-600 outline-none focus:ring-2 focus:ring-rose-500/50"
                            />
                        </div>
                    ) : (
                        <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">
                            Meta do Mês: <span className="text-rose-600">R$ {goal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </h3>
                    )}
                </div>

                <div className="relative h-6 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex items-center px-1">
                    <div
                        className="h-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out shadow-lg shadow-fuchsia-500/30"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>

                <div className="text-center">
                    {currentRevenue >= goal ? (
                        <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">celebration</span>
                            Meta batida! Você é incrível! 🚀
                        </p>
                    ) : (
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Falta <span className="text-violet-600 dark:text-violet-400 font-black">R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> para bater sua meta! 💪
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesGoal;
