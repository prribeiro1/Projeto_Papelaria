import React, { useMemo } from 'react';
import { useOrders, useDashboardStats } from '../hooks/useData';
import { supabase } from '../supabaseClient';
import { OrderStatus } from '../types';

const Dashboard: React.FC = () => {
  const { orders, loading: loadingOrders } = useOrders();
  const { stats, loading: loadingStats } = useDashboardStats();
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserName(user?.email?.split('@')[0] || 'Usuário');
    });
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const dashboardCards = [
    { label: 'Lucro Estimado', value: `R$ ${stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-emerald-500', icon: 'payments', trend: '+12%', bg: 'bg-emerald-500/5' },
    { label: 'Pagamentos Pendentes', value: stats.pendingPayments.toString(), color: 'text-amber-500', icon: 'warning', trend: stats.pendingPayments > 0 ? 'Atenção' : 'OK', bg: 'bg-amber-500/5' },
    { label: 'Em Produção', value: stats.ordersInProduction.toString(), color: 'text-primary', icon: 'layers', trend: 'Ativos', bg: 'bg-primary/5' },
    { label: 'Novos Clientes', value: stats.newClients.toString(), color: 'text-purple-500', icon: 'group_add', trend: 'Base', bg: 'bg-purple-500/5' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      <header className="flex-shrink-0 px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {getTimeGreeting()}, <span className="text-primary">{userName}</span>! 👋
            </h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-10 pb-10 flex flex-col gap-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card, idx) => (
            <div key={idx} className="group bg-white dark:bg-[#16212e] p-7 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 size-24 ${card.bg} rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}></div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`size-10 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-black ${card.color}`}>{card.value}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${card.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Orders List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Pedidos Recentes</h3>
              <button className="text-xs font-black text-primary hover:underline">VER TODOS</button>
            </div>
            <div className="bg-white dark:bg-[#16212e] rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
              {loadingOrders ? (
                <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentOrders.map(order => (
                    <div key={order.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-5">
                        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <span className="material-symbols-outlined text-2xl">package_2</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{order.clientName}</span>
                          <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{order.productName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end">
                          <span className="text-xs font-black text-slate-900 dark:text-white">R$ {order.value.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{order.createdAt}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${order.status === OrderStatus.READY ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          order.status === OrderStatus.IN_PRODUCTION ? 'bg-primary/5 text-primary border-primary/20' :
                            'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined text-5xl mb-2">inbox</span>
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhum pedido</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Tips */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Atalhos Rápidos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary p-6 rounded-[32px] text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform cursor-pointer flex flex-col gap-4">
                  <span className="material-symbols-outlined text-3xl">add_circle</span>
                  <span className="text-xs font-black uppercase tracking-wider leading-none">Novo<br />Pedido</span>
                </div>
                <div className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform cursor-pointer flex flex-col gap-4">
                  <span className="material-symbols-outlined text-3xl">person_add</span>
                  <span className="text-xs font-black uppercase tracking-wider leading-none">Novo<br />Cliente</span>
                </div>
                <div className="bg-amber-500 p-6 rounded-[32px] text-white shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-transform cursor-pointer flex flex-col gap-4">
                  <span className="material-symbols-outlined text-3xl">receipt_long</span>
                  <span className="text-xs font-black uppercase tracking-wider leading-none">Novo<br />Orçamento</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-[32px] text-white shadow-xl shadow-slate-800/20 hover:scale-[1.02] transition-transform cursor-pointer flex flex-col gap-4">
                  <span className="material-symbols-outlined text-3xl">print</span>
                  <span className="text-xs font-black uppercase tracking-wider leading-none">Imprimir<br />Relatórios</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-40 bg-primary/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
              <h4 className="text-lg font-black mb-2 relative z-10">Dica do PapelariaSys</h4>
              <p className="text-sm text-slate-400 font-medium relative z-10 leading-relaxed mb-6">Mantenha seus prazos atualizados na aba de Produção para receber alertas automáticos.</p>
              <button className="bg-white/10 hover:bg-white/20 transition-all text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl relative z-10">Acessar Produção</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
