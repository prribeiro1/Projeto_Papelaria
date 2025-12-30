import React, { useState, useMemo } from 'react';
import { useOrders } from '../hooks/useData';
import { supabase } from '../supabaseClient';
import { OrderStatus, Order } from '../types';

const Production: React.FC = () => {
  const { orders, refresh, loading } = useOrders();
  const [view, setView] = useState<'calendar' | 'kanban'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
    } else {
      refresh();
      setActiveMenu(null);
    }
  };

  const stages = [
    OrderStatus.PENDING,
    OrderStatus.WAITING_ART,
    OrderStatus.IN_PRODUCTION,
    OrderStatus.READY
  ];

  // Stats
  const stats = useMemo(() => {
    const inProgress = orders.filter(o =>
      o.status !== OrderStatus.READY && o.status !== OrderStatus.DELIVERED
    ).length;
    const delivered = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
    return { inProgress, delivered, total: orders.length };
  }, [orders]);

  // Calendar logic
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    // Pad previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, orders: [] });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${d.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
      const dayOrders = orders.filter(o => o.deadline === dateStr);
      days.push({ day: d, orders: dayOrders });
    }
    return days;
  }, [currentDate, orders]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined font-bold">calendar_month</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Produção</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">Gerencie a produção dos pedidos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-all">
          <span className="material-symbols-outlined text-[20px]">print</span>
          <span>Imprimir</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fff9e6] dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex flex-col items-center">
            <span className="text-3xl font-black text-amber-600 mb-1">{stats.inProgress}</span>
            <span className="text-xs font-bold text-amber-700/70 uppercase tracking-wider">Em Andamento</span>
          </div>
          <div className="bg-[#e6fcf5] dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 flex flex-col items-center">
            <span className="text-3xl font-black text-emerald-600 mb-1">{stats.delivered}</span>
            <span className="text-xs font-bold text-emerald-700/70 uppercase tracking-wider">Entregas</span>
          </div>
          <div className="bg-[#f3f0ff] dark:bg-primary/10 p-6 rounded-3xl border border-primary/10 flex flex-col items-center">
            <span className="text-3xl font-black text-primary mb-1">{stats.total}</span>
            <span className="text-xs font-bold text-primary/70 uppercase tracking-wider">Total em Produção</span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'calendar' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>Calendário</span>
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'kanban' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_kanban</span>
            <span>Fluxo (Kanban)</span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : view === 'calendar' ? (
          <div className="bg-white dark:bg-[#16212e] rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-white capitalize">{monthName}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg">Hoje</button>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="bg-slate-50 dark:bg-slate-800/50 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
              {calendarData.map((item, idx) => (
                <div key={idx} className={`min-h-[120px] bg-white dark:bg-[#16212e] p-2 flex flex-col gap-1 ${!item.day ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                  {item.day && (
                    <span className={`text-xs font-bold mb-1 ml-1 ${item.day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
                      ? 'bg-primary text-white size-6 rounded-lg flex items-center justify-center'
                      : 'text-slate-400'
                      }`}>
                      {item.day}
                    </span>
                  )}
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {item.orders.map(order => (
                      <div key={order.id} className="text-[10px] px-2 py-1 rounded bg-primary/5 text-primary border border-primary/10 font-bold truncate" title={order.productName}>
                        {order.productName}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {stages.map((stage) => (
              <div key={stage} className="flex flex-col w-80 min-w-[320px] h-full flex-shrink-0">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${stage === OrderStatus.PENDING ? 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]' :
                      stage === OrderStatus.IN_PRODUCTION ? 'bg-primary shadow-[0_0_8px_rgba(124,58,237,0.5)]' :
                        stage === OrderStatus.READY ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      }`}></div>
                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{stage}</h3>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {orders.filter(o => o.status === stage).length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar">
                  {orders.filter(o => o.status === stage).map((order) => (
                    <div key={order.id} className="bg-white dark:bg-[#16212e] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black tracking-widest uppercase">
                          #{order.id.slice(0, 6)}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === order.id ? null : order.id);
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-xl">more_vert</span>
                          </button>

                          {activeMenu === order.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                              <div className="p-2 flex flex-col gap-1">
                                {Object.values(OrderStatus).map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(order.id, status)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${order.status === status
                                      ? 'bg-primary text-white'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                  >
                                    <div className={`size-2 rounded-full ${status === OrderStatus.READY ? 'bg-emerald-500' :
                                      status === OrderStatus.DELIVERED ? 'bg-blue-500' :
                                        status === OrderStatus.PENDING ? 'bg-slate-400' : 'bg-amber-400'}`} />
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <h4 className="text-slate-900 dark:text-white font-black text-sm mb-1 leading-snug">{order.productName}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-4">{order.clientName}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">event</span>
                          <span className="text-[10px] font-bold">{order.deadline}</span>
                        </div>
                        <div className="bg-primary/10 text-primary border border-primary/20 rounded-full size-7 flex items-center justify-center text-[10px] font-black">
                          {order.clientName.charAt(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === stage).length === 0 && (
                    <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                      <span className="material-symbols-outlined text-4xl mb-2 italic">shopping_cart_off</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Production;
