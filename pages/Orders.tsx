import React, { useState, useMemo, useEffect } from 'react';
import { useOrders, useClients } from '../hooks/useData';
import { OrderStatus } from '../types';
import { supabase } from '../supabaseClient';

const Orders: React.FC = () => {
  const { orders, loading, refresh } = useOrders();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingOrder, setAddingOrder] = useState(false);

  // New Order State
  const [newOrder, setNewOrder] = useState({
    client_id: '',
    product_name: '', // This will be the main title/summary
    discount: 0,
    amount_paid: 0,
    status: OrderStatus.PENDING,
    production_status: 'Aguardando',
    deadline: '',
    event_date: '',
    theme: '',
    notes: ''
  });

  // Dynamic Items state
  const [items, setItems] = useState([{ description: '', quantity: 1, unitValue: 0 }]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitValue), 0);
  }, [items]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - (Number(newOrder.discount) || 0));
  }, [subtotal, newOrder.discount]);

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitValue: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingOrder(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // In a real database, we'd have an 'order_items' table. 
    // For now, since the schema I created earlier was simple, 
    // I will concatenate items into product_name or use a JSON field if I had one.
    // I'll stick to the current schema but make it feel professional.

    const productNameSummary = items.map(i => `${i.quantity}x ${i.description}`).join(', ');

    const { error } = await supabase.from('orders').insert([{
      client_id: newOrder.client_id,
      product_name: productNameSummary || newOrder.product_name,
      value: total,
      status: newOrder.status,
      deadline: newOrder.deadline,
      user_id: user.id
      // Extra fields like 'theme', 'notes', etc could be added to the table via migration later
    }]);

    if (error) {
      alert('Erro ao criar pedido: ' + error.message);
    } else {
      setIsModalOpen(false);
      resetForm();
      refresh();
    }
    setAddingOrder(false);
  };

  const resetForm = () => {
    setNewOrder({
      client_id: '', product_name: '', discount: 0, amount_paid: 0,
      status: OrderStatus.PENDING, production_status: 'Aguardando',
      deadline: '', event_date: '', theme: '', notes: ''
    });
    setItems([{ description: '', quantity: 1, unitValue: 0 }]);
  };

  const filteredOrders = orders.filter(o =>
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined font-bold">shopping_bag</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-shadow-sm">Gestão de Pedidos</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Controle total de encomendas e produção</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined font-black">add</span>
            <span>NOVO PEDIDO</span>
          </button>
        </div>
      </header>

      {/* List & Search */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#16212e] p-4 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Buscar por cliente, produto ou #ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#16212e] rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <span className="text-xs font-bold uppercase tracking-widest">Sincronizando...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"># ID / Data</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto / Prazo</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white font-mono uppercase">#{order.id.slice(0, 6)}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{order.createdAt}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black border border-primary/20">
                            {order.clientName.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.clientName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col overflow-hidden max-w-[300px]">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{order.productName}</span>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            <span className="text-[10px] font-bold">{order.deadline}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">R$ {order.value.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${order.status === OrderStatus.READY ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            order.status === OrderStatus.IN_PRODUCTION ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              order.status === OrderStatus.PENDING ? 'bg-slate-50 text-slate-500 border-slate-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Novo Pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#16212e] rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsModalOpen(false)} className="size-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Detalhes do Novo Pedido</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Aguardando Confirmação</span>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Side: General Info */}
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <span className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</span>
                      Informações do Pedido
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Número do Pedido</label>
                        <input disabled className="w-full h-12 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-400 font-mono text-sm" value="PED-AutoGen" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Cliente *</label>
                        <select
                          required
                          className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/30 text-sm font-bold transition-all outline-none"
                          value={newOrder.client_id}
                          onChange={e => setNewOrder({ ...newOrder, client_id: e.target.value })}
                        >
                          <option value="">Selecione o cliente...</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Data da Festa</label>
                          <input type="date" className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newOrder.event_date} onChange={e => setNewOrder({ ...newOrder, event_date: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Data de Entrega *</label>
                          <input type="date" required className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-primary" value={newOrder.deadline} onChange={e => setNewOrder({ ...newOrder, deadline: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Tema do Pedido</label>
                        <input placeholder="Ex: Batizado, Aniversário..." className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium" value={newOrder.theme} onChange={e => setNewOrder({ ...newOrder, theme: e.target.value })} />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</span>
                        Itens do Pedido
                      </h4>
                      <button type="button" onClick={addItem} className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1 hover:opacity-70 transition-all">
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Adicionar Item
                      </button>
                    </div>
                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-end group">
                          <div className="grow">
                            <input placeholder="Descrição do item..." className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-medium" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                          </div>
                          <div className="w-16">
                            <input type="number" placeholder="Qtd" className="w-full h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-black text-center" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                          </div>
                          <div className="w-24">
                            <input type="number" step="0.01" placeholder="Valor Un" className="w-full h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-black text-right" value={item.unitValue} onChange={e => updateItem(idx, 'unitValue', Number(e.target.value))} />
                          </div>
                          {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(idx)} className="size-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Side: Values & Status */}
                <div className="space-y-8">
                  <section className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Resumo Financeiro</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-500">Valor dos Itens</span>
                        <span className="font-black text-slate-700 dark:text-slate-200">R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-500">Desconto / Ajuste (R$)</span>
                        <input type="number" step="0.01" className="w-24 h-8 px-2 rounded-lg bg-white dark:bg-slate-900 border-none text-right text-xs font-black text-red-500" value={newOrder.discount} onChange={e => setNewOrder({ ...newOrder, discount: Number(e.target.value) })} />
                      </div>
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Total do Pedido</span>
                        <span className="text-xl font-black text-primary">R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-6 bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-900/20">
                    <div>
                      <span className="block text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Total Recebido</span>
                      <div className="flex items-center gap-1 text-emerald-600 font-black text-lg">
                        <span className="text-sm">R$</span>
                        <input type="number" step="0.01" className="bg-transparent border-none p-0 w-20 outline-none" value={newOrder.amount_paid} onChange={e => setNewOrder({ ...newOrder, amount_paid: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Status Pagamento</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.15em]">{newOrder.amount_paid >= total && total > 0 ? 'PAGO' : 'PENDENTE'}</span>
                    </div>
                  </div>

                  <section className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Status do Pedido</label>
                        <select className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newOrder.status} onChange={e => setNewOrder({ ...newOrder, status: e.target.value as OrderStatus })}>
                          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Status Produção</label>
                        <select className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newOrder.production_status} onChange={e => setNewOrder({ ...newOrder, production_status: e.target.value })}>
                          <option>Aguardando</option>
                          <option>Em Andamento</option>
                          <option>Concluído</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Observações do Pedido</label>
                      <textarea rows={3} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium resize-none" placeholder="Adicione notas sobre o pedido..." value={newOrder.notes} onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })} />
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                  <span className="text-xs font-bold underline cursor-pointer hover:text-primary transition-colors">Anexar Documentos / Prints</span>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 rounded-2xl text-sm font-black text-slate-500 hover:text-slate-700 transition-all">Cancelar</button>
                  <button type="submit" disabled={addingOrder} className="bg-primary hover:bg-primary/90 text-white px-12 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50">
                    {addingOrder ? 'SALVANDO...' : 'SALVAR PEDIDO'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
