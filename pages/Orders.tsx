import React, { useState } from 'react';
import { useOrders, useClients } from '../hooks/useData';
import { OrderStatus } from '../types';
import { supabase } from '../supabaseClient';

const Orders: React.FC = () => {
  const { orders, loading, refresh } = useOrders();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingOrder, setAddingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    client_id: '',
    product_name: '',
    value: '',
    status: OrderStatus.PENDING,
    deadline: ''
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingOrder(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('orders').insert([{
      ...newOrder,
      value: Number(newOrder.value),
      user_id: user.id
    }]);

    if (error) {
      alert('Erro ao criar pedido: ' + error.message);
    } else {
      setIsModalOpen(false);
      setNewOrder({ client_id: '', product_name: '', value: '', status: OrderStatus.PENDING, deadline: '' });
      refresh();
    }
    setAddingOrder(false);
  };

  const filteredOrders = orders.filter(o =>
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Lista de Pedidos</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie, filtre e acompanhe o status de todas as encomendas.</p>
          </div>
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold h-10 px-5 shadow-sm shadow-blue-500/20 transition-all active:scale-95"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            Novo Pedido
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-full lg:max-w-md">
              <label className="relative flex items-center w-full h-10">
                <span className="absolute left-3 text-slate-400 material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
                <input
                  className="w-full h-full pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Buscar por número, cliente ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Carregando pedidos...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-500">Nenhum pedido encontrado.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24"># ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Cliente</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Criação</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prazo</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Total</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white font-mono">{order.id.slice(0, 6).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-violet-100 text-violet-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                              {order.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{order.clientName}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{order.productName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{order.createdAt}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{order.deadline}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">R$ {order.value.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === OrderStatus.IN_PRODUCTION ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              order.status === OrderStatus.WAITING_ART ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                order.status === OrderStatus.READY ? 'bg-green-100 text-green-700 border-green-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Novo Pedido</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                <select
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  value={newOrder.client_id}
                  onChange={e => setNewOrder({ ...newOrder, client_id: e.target.value })}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Produto / Serviço</label>
                <input
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  value={newOrder.product_name}
                  onChange={e => setNewOrder({ ...newOrder, product_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="number" step="0.01" required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={newOrder.value}
                    onChange={e => setNewOrder({ ...newOrder, value: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Prazo</label>
                  <input
                    type="date" required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={newOrder.deadline}
                    onChange={e => setNewOrder({ ...newOrder, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status Inicial</label>
                <select
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  value={newOrder.status}
                  onChange={e => setNewOrder({ ...newOrder, status: e.target.value as OrderStatus })}
                >
                  {Object.values(OrderStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingOrder}
                  className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  {addingOrder ? 'Salvando...' : 'Criar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
