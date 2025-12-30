import React from 'react';
import { useOrders } from '../hooks/useData';
import { OrderStatus } from '../types';

const Production: React.FC = () => {
  const { orders, loading } = useOrders();
  const stages = [
    OrderStatus.PENDING,
    OrderStatus.WAITING_ART,
    OrderStatus.IN_PRODUCTION,
    OrderStatus.FINISHING,
    OrderStatus.READY
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Fluxo de Produção</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie o status de cada item em tempo real.</p>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-background-light dark:bg-background-dark">
        <div className="flex h-full gap-6 min-w-max">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Carregando fluxo de produção...
            </div>
          ) : stages.map((stage) => (
            <div key={stage} className="flex flex-col w-80 h-full flex-shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${stage === OrderStatus.PENDING ? 'bg-slate-400' :
                      stage === OrderStatus.IN_PRODUCTION ? 'bg-primary' :
                        stage === OrderStatus.READY ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}></div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{stage}</h3>
                  <span className="flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full size-5">
                    {orders.filter(o => o.status === stage).length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 pb-2">
                {orders.filter(o => o.status === stage).map((order) => (
                  <div key={order.id} className="group bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-primary/50 cursor-pointer transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                        #{order.id.slice(0, 6)}
                      </span>
                    </div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1 leading-snug">{order.productName}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">{order.clientName}</p>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        <span>{order.deadline}</span>
                      </div>
                      <div className="bg-primary/10 rounded-full size-6 flex items-center justify-center text-[10px] font-bold text-primary">
                        {order.clientName.charAt(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Production;
