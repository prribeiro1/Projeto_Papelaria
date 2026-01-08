import React, { useState, useMemo, useEffect } from 'react';
import { useOrders, useClients, useCompanySettings, useProducts } from '../hooks/useData';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { OrderStatus, Client } from '../types';
import jsPDF from 'jspdf';

const Orders: React.FC = () => {
  const { orders, refresh, loading } = useOrders();
  const { clients } = useClients();
  const { settings } = useCompanySettings();
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  // New Order State
  const [newOrder, setNewOrder] = useState({
    clientSelector: '', // name or ID name
    product_name: '', // This will be the main title/summary
    discount: 0,
    amount_paid: 0,
    status: OrderStatus.PENDING,
    production_status: 'Aguardando',
    deadline: '',
    event_date: '',
    theme: '',
    notes: '',
    cost_value: 0,
    payment_method: 'Dinheiro',
    id: '' // Used for editing
  });

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setIsModalOpen(true);
    }
  }, [location]);

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

  const handleGeneratePDF = (order: any) => {
    setGeneratingPdf(order.id);
    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235); // Primary color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(settings?.name || 'PROATIVX', 20, 25);
    doc.setFontSize(10);
    doc.text('RECIBO DE PEDIDO #' + order.id.slice(0, 8), 20, 32);

    // Content
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text('Cliente: ' + order.clientName, 20, 60);
    doc.text('Produto: ' + order.productName, 20, 70);
    doc.text('Data: ' + order.createdAt, 20, 80);
    doc.text('Prazo: ' + order.deadline, 20, 90);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 100, 190, 100);

    // Financials
    doc.setFontSize(14);
    doc.text('Valor Total:', 140, 120);
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('R$ ' + order.value.toFixed(2), 140, 130);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Gerado automaticamente pelo PROATIVX', 105, 280, { align: 'center' });

    doc.save(`pedido_${order.id.slice(0, 8)}.pdf`);
    setGeneratingPdf(null);
  };

  const handleWhatsApp = (order: any) => {
    const client = clients.find(c => c.name === order.clientName);
    if (!client || !client.phone) {
      alert('Telefone do cliente não cadastrado!');
      return;
    }

    let message = `Olá ${order.clientName}! Passando para informar que seu pedido (#${order.id.slice(0, 8)}) está com status: ${order.status.toUpperCase()}. Qualquer dúvida, estamos à disposição!`;

    if (settings?.pixKey) {
      message += `\n\nCaso deseje realizar o pagamento via PIX, nossa chave é: *${settings.pixKey}*`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Resolve Client ID (Search by name or Create)
    let finalClientId = '';
    const existingClient = clients.find(c => c.name.toLowerCase() === newOrder.clientSelector.toLowerCase());

    if (existingClient) {
      finalClientId = existingClient.id;
    } else {
      const { data: createdClient, error: clientErr } = await supabase
        .from('clients')
        .insert([{ name: newOrder.clientSelector, user_id: user.id, status: 'Novo' }])
        .select()
        .single();

      if (clientErr) {
        alert('Erro ao criar cliente automaticamente: ' + clientErr.message);
        setSaving(false);
        return;
      }
      finalClientId = createdClient.id;
    }

    const productNameSummary = items.map(i => `${i.quantity}x ${i.description}`).join(', ');

    const orderPayload = {
      client_id: finalClientId,
      product_name: productNameSummary || newOrder.product_name,
      value: total,
      status: newOrder.status,
      deadline: newOrder.deadline,
      user_id: user.id,
      cost_value: newOrder.cost_value,
      event_date: newOrder.event_date,
      theme: newOrder.theme,
      notes: newOrder.notes,
      discount: newOrder.discount,
      amount_paid: newOrder.amount_paid,
      production_status: newOrder.production_status,
      payment_method: newOrder.payment_method,
      items: items
    };



    let error;

    if (newOrder.id) {
      // Update existing
      const { error: err } = await supabase.from('orders').update({
        ...orderPayload,
        user_id: undefined // Don't update user_id
      }).eq('id', newOrder.id);
      error = err;
    } else {
      // Create new
      const { error: err } = await supabase.from('orders').insert([orderPayload]);
      error = err;
    }

    if (error) {
      alert('Erro ao criar pedido: ' + error.message);
    } else {
      setIsModalOpen(false);
      resetForm();
      refresh();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setNewOrder({
      clientSelector: '', product_name: '', discount: 0, amount_paid: 0,
      status: OrderStatus.PENDING, production_status: 'Aguardando',
      deadline: '', event_date: '', theme: '', notes: '', cost_value: 0,
      payment_method: 'Dinheiro', id: ''
    });
    setItems([{ description: '', quantity: 1, unitValue: 0 }]);
  };

  const filteredOrders = orders.filter(o =>
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined font-bold">shopping_bag</span>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight text-shadow-sm">Gestão de Pedidos</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm font-medium">Controle total de encomendas e produção</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 lg:py-4 rounded-2xl font-black text-xs lg:text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined font-black">add</span>
            <span>NOVO PEDIDO</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#16212e] p-4 rounded-[28px] lg:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Buscar por cliente, produto ou #ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#16212e] rounded-[28px] lg:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
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
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendente</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Produção</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] lg:text-xs font-black text-slate-900 dark:text-white font-mono uppercase">#{order.id.slice(0, 6)}</span>
                          <span className="text-[9px] lg:text-[10px] text-slate-400 font-bold">{order.createdAt}</span>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 lg:size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] lg:text-xs font-black border border-primary/20">
                            {order.clientName.charAt(0)}
                          </div>
                          <span className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-200">{order.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <div className="flex flex-col overflow-hidden max-w-[200px] lg:max-w-[300px]">
                          <span className="text-xs lg:text-sm font-black text-slate-800 dark:text-slate-100 truncate">{order.productName}</span>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="material-symbols-outlined text-[12px] lg:text-[14px]">event</span>
                            <span className="text-[9px] lg:text-[10px] font-bold">{order.deadline}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <span className="text-xs lg:text-sm font-black text-emerald-600">R$ {order.value.toFixed(2)}</span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <span className={`text-xs lg:text-sm font-black ${(order.value - (order.amountPaid || 0)) > 0.01 ? 'text-amber-500' : 'text-slate-300'}`}>
                          R$ {Math.max(0, order.value - (order.amountPaid || 0)).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-center">
                        <span className="inline-flex px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                          {order.productionStatus || 'Aguardando'}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-center">
                        <span className={`inline-flex px-2 lg:px-3 py-1 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-wider border ${order.status === OrderStatus.READY ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          order.status === OrderStatus.IN_PRODUCTION ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            order.status === OrderStatus.PENDING ? 'bg-slate-50 text-slate-500 border-slate-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-right">
                        <div className="flex justify-end gap-1 lg:gap-2">
                          <button
                            onClick={() => {
                              setNewOrder({
                                clientSelector: order.clientName,
                                product_name: order.productName,
                                discount: order.discount,
                                amount_paid: order.amountPaid,
                                status: order.status as OrderStatus,
                                production_status: order.productionStatus,
                                deadline: order.deadline === 'Sem prazo' ? '' : order.deadline.split('/').reverse().join('-'), // Check date format
                                event_date: order.eventDate ? order.eventDate.split('/').reverse().join('-') : '',
                                theme: order.theme,
                                notes: order.notes,
                                cost_value: order.costValue || 0,
                                payment_method: order.paymentMethod,
                                id: order.id
                              });
                              setItems(order.items && order.items.length ? order.items : [{ description: '', quantity: 1, unitValue: 0 }]); // Populate items if available
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 lg:p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            title="Pagamento / Editar"
                          >
                            <span className="material-symbols-outlined text-lg lg:text-xl">monetization_on</span>
                          </button>
                          <button
                            onClick={() => {
                              // Same logic as Payment but maybe distinct icon visually
                              setNewOrder({
                                clientSelector: order.clientName,
                                product_name: order.productName,
                                discount: order.discount,
                                amount_paid: order.amountPaid,
                                status: order.status as OrderStatus,
                                production_status: order.productionStatus,
                                deadline: order.deadline === 'Sem prazo' ? '' : order.deadline.split('/').reverse().join('-'),
                                event_date: order.eventDate ? order.eventDate.split('/').reverse().join('-') : '',
                                theme: order.theme,
                                notes: order.notes,
                                cost_value: order.costValue || 0,
                                payment_method: order.paymentMethod,
                                id: order.id
                              });
                              setItems(order.items && order.items.length ? order.items : [{ description: '', quantity: 1, unitValue: 0 }]);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 lg:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            title="Editar Pedido"
                          >
                            <span className="material-symbols-outlined text-lg lg:text-xl">edit</span>
                          </button>
                          <button
                            onClick={() => handleWhatsApp(order)}
                            className="p-1.5 lg:p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Enviar WhatsApp"
                          >
                            <span className="material-symbols-outlined text-lg lg:text-xl">chat</span>
                          </button>
                          <button
                            onClick={() => handleGeneratePDF(order)}
                            className="p-1.5 lg:p-2 text-primary hover:bg-blue-50 rounded-xl transition-all"
                            title="Gerar PDF"
                            disabled={generatingPdf === order.id}
                          >
                            <span className="material-symbols-outlined text-lg lg:text-xl">
                              {generatingPdf === order.id ? 'sync' : 'picture_as_pdf'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#16212e] rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsModalOpen(false)} className="size-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {newOrder.id ? 'Editar Pedido' : 'Novo Pedido'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      Informações do Pedido
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Cliente *</label>
                        <input
                          required
                          list="clients-list"
                          placeholder="Digite o nome do cliente..."
                          className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none"
                          value={newOrder.clientSelector}
                          onChange={e => setNewOrder({ ...newOrder, clientSelector: e.target.value })}
                        />
                        <datalist id="clients-list">
                          {clients.map(c => <option key={c.id} value={c.name} />)}
                        </datalist>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Data da Festa</label>
                          <input type="date" className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none" value={newOrder.event_date} onChange={e => setNewOrder({ ...newOrder, event_date: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Data de Entrega *</label>
                          <input type="date" required className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none" value={newOrder.deadline} onChange={e => setNewOrder({ ...newOrder, deadline: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 mb-1.5 ml-1 block">Forma de Pagamento</label>
                        <select
                          className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold appearance-none outline-none"
                          value={newOrder.payment_method}
                          onChange={e => setNewOrder({ ...newOrder, payment_method: e.target.value })}
                        >
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Pix">Pix</option>
                          <option value="Cartão de Crédito">Cartão de Crédito</option>
                          <option value="Cartão de Débito">Cartão de Débito</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Preço Sugerido</label>
                          <div className="h-12 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center text-sm font-black text-slate-500">
                            R$ {subtotal.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Custo Total</label>
                          <input type="number" step="0.01" className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-black outline-none" placeholder="R$ 0,00" value={newOrder.cost_value} onChange={e => setNewOrder({ ...newOrder, cost_value: Number(e.target.value) })} />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Itens do Pedido</h4>
                      <button type="button" onClick={addItem} className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">Adicionar Item</button>
                    </div>
                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex-1 flex gap-2">
                            <input
                              list={`products-list-${idx}`}
                              placeholder="Item ou selecione produto..."
                              className="flex-1 h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs"
                              value={item.description}
                              onChange={e => {
                                const val = e.target.value;
                                const prod = products.find(p => p.name === val);
                                if (prod) {
                                  updateItem(idx, 'description', prod.name);
                                  updateItem(idx, 'unitValue', Number(prod.price));
                                } else {
                                  updateItem(idx, 'description', val);
                                }
                              }}
                            />
                            <datalist id={`products-list-${idx}`}>
                              {products.map(p => <option key={p.id} value={p.name}>{p.category} - R$ {Number(p.price).toFixed(2)}</option>)}
                            </datalist>
                          </div>
                          <input type="number" className="w-16 h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs text-center font-black" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                          <input type="number" step="0.01" className="w-24 h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs text-right font-black" value={item.unitValue} onChange={e => updateItem(idx, 'unitValue', Number(e.target.value))} />
                          <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Resumo Operacional</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-500">Subtotal</span>
                        <span className="font-black">R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-red-500">
                        <span className="font-bold">Desconto (-)</span>
                        <input type="number" step="0.01" className="w-24 h-8 px-2 rounded-lg bg-white dark:bg-slate-900 border-none text-right font-black" value={newOrder.discount} onChange={e => setNewOrder({ ...newOrder, discount: Number(e.target.value) })} />
                      </div>
                      <div className="pt-4 border-t flex justify-between items-center text-xl font-black text-primary">
                        <span>TOTAL</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-500 mb-1.5 block ml-1">Status</label>
                      <select className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newOrder.status} onChange={e => setNewOrder({ ...newOrder, status: e.target.value as OrderStatus })}>
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 mb-1.5 block ml-1">Recebido (R$)</label>
                      <input type="number" step="0.01" className="w-full h-12 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 font-black outline-none border-none" value={newOrder.amount_paid} onChange={e => setNewOrder({ ...newOrder, amount_paid: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 rounded-2xl text-sm font-black text-slate-400">Cancelar</button>
                <button type="submit" disabled={saving} className="bg-primary text-white px-12 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 disabled:opacity-50">
                  {saving ? 'SALVANDO...' : 'FECHAR PEDIDO'}
                </button>
              </div>
            </form>
          </div >
        </div >
      )}
    </div >
  );
};

export default Orders;
