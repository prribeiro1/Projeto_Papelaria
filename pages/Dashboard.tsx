import React, { useEffect, useState } from 'react';
import { useDashboardStats, useOrders } from '../hooks/useData';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

const StatCard = ({ title, value, sub, icon, color, loading }: any) => (
  <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
    <div className={`absolute -right-2 -top-2 size-24 ${color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full flex items-center justify-center`}>
      <span className="material-symbols-outlined text-6xl">{icon}</span>
    </div>
    <div className="relative z-10">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded"></div>
      ) : (
        <h3 className="text-slate-900 dark:text-white text-2xl font-black">{value}</h3>
      )}
      <p className="text-slate-400 text-[11px] mt-1 font-medium">{sub}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { orders, loading: ordersLoading } = useOrders();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const userName = user?.email?.split('@')[0] || 'Visitante';
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Olá, {userName.charAt(0).toUpperCase() + userName.slice(1)}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Aqui está o resumo da sua papelaria hoje.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Faturamento"
            value={`R$ ${stats.faturamento.toFixed(2)}`}
            sub="Total em entradas"
            icon="payments"
            color="bg-emerald-500"
            loading={statsLoading}
          />
          <StatCard
            title="Despesas"
            value={`R$ ${stats.despesas.toFixed(2)}`}
            sub="Total em saídas"
            icon="trending_down"
            color="bg-red-500"
            loading={statsLoading}
          />
          <StatCard
            title="Produção Ativa"
            value={stats.producao.toString()}
            sub="Pedidos em produção"
            icon="layers"
            color="bg-blue-500"
            loading={statsLoading}
          />
          <StatCard
            title="Total Clientes"
            value={stats.clientesNovos.toString()}
            sub="Base de clientes"
            icon="group_add"
            color="bg-purple-500"
            loading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-slate-900 dark:text-white">Pedidos Recentes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/40">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Produto</th>
                      <th className="px-6 py-3">Valor</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {ordersLoading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Carregando pedidos...</td></tr>
                    ) : recentOrders.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum pedido recente.</td></tr>
                    ) : (
                      recentOrders.map(order => (
                        <tr key={order.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{order.id.slice(0, 6).toUpperCase()}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{order.clientName}</td>
                          <td className="px-6 py-4 text-slate-500">{order.productName}</td>
                          <td className="px-6 py-4 font-black text-slate-900 dark:text-white">R$ {order.value.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-black uppercase">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
