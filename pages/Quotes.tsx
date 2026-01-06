import React, { useState, useMemo, useEffect } from 'react';
import { useQuotes, useClients, useCompanySettings, useProducts } from '../hooks/useData';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Quote } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { generatePixCopyPaste } from '../utils/pix';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Quotes: React.FC = () => {
    const { quotes, loading, refresh } = useQuotes();
    const { clients } = useClients();
    const { settings } = useCompanySettings();
    const { products } = useProducts();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [converting, setConverting] = useState<string | null>(null);

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('new') === 'true') {
            setIsModalOpen(true);
        }
    }, [location]);

    const [newQuote, setNewQuote] = useState({
        clientSelector: '',
        description: '',
        value: 0,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        event_date: '',
        theme: '',
        notes: '',
        items: [{ description: '', quantity: 1, unitValue: 0 }]
    });

    const addItem = () => setNewQuote({ ...newQuote, items: [...newQuote.items, { description: '', quantity: 1, unitValue: 0 }] });
    const removeItem = (index: number) => setNewQuote({ ...newQuote, items: newQuote.items.filter((_, i) => i !== index) });
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...newQuote.items];
        (newItems[index] as any)[field] = value;
        setNewQuote({ ...newQuote, items: newItems });
    };

    const quoteSubtotal = useMemo(() => {
        return newQuote.items.reduce((acc, item) => acc + (item.quantity * item.unitValue), 0);
    }, [newQuote.items]);

    const filteredQuotes = useMemo(() =>
        quotes.filter(q =>
            q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.description.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [quotes, searchTerm]);

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Resolve Client ID (Search by name or Create)
        let finalClientId = '';
        const existingClient = clients.find(c => c.name.toLowerCase() === newQuote.clientSelector.toLowerCase());

        if (existingClient) {
            finalClientId = existingClient.id;
        } else {
            const { data: createdClient, error: clientErr } = await supabase
                .from('clients')
                .insert([{ name: newQuote.clientSelector, user_id: user.id, status: 'Novo' }])
                .select()
                .single();

            if (clientErr) {
                alert('Erro ao criar cliente automaticamente: ' + clientErr.message);
                return;
            }
            finalClientId = createdClient.id;
        }

        const { error } = await supabase.from('quotes').insert([{
            client_id: finalClientId,
            description: newQuote.description,
            value: quoteSubtotal,
            valid_until: newQuote.valid_until,
            event_date: newQuote.event_date || null,
            theme: newQuote.theme || null,
            notes: newQuote.notes,
            items: newQuote.items,
            user_id: user.id,
            status: 'Rascunho'
        }]);

        if (error) alert('Erro: ' + error.message);
        else {
            setIsModalOpen(false);
            refresh();
        }
    };

    const convertToOrder = async (quote: Quote) => {
        if (!confirm('Deseja converter este orçamento em um pedido ativo?')) return;
        setConverting(quote.id);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: order, error: orderErr } = await supabase.from('orders').insert([{
            user_id: user.id,
            client_id: quote.clientId,
            product_name: quote.description,
            value: quote.value,
            status: 'Pendente',
            items: quote.items,
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }]).select().single();

        if (orderErr) {
            alert('Erro ao criar pedido: ' + orderErr.message);
        } else {
            await supabase.from('quotes').update({ status: 'Aprovado' }).eq('id', quote.id);
            alert('Orçamento convertido com sucesso! Verifique na aba de Pedidos.');
            refresh();
        }
        setConverting(null);
    };

    const handleShare = (quote: Quote) => {
        setSelectedQuote(quote);
        let msg = settings?.quoteMessageTemplate || 'Olá {{clientName}}! Segue em anexo o orçamento: *{{description}}* no valor de *R$ {{total}}*. Aguardamos sua confirmação!';
        msg = msg.replace('{{clientName}}', quote.clientName || 'Cliente')
            .replace('{{description}}', quote.description)
            .replace('{{total}}', quote.value.toFixed(2))
            .replace('{{pixKey}}', settings?.pixKey || '');
        setCustomMessage(msg);
        setIsShareModalOpen(true);
    };

    const generateExport = async (type: 'pdf' | 'image') => {
        setIsGenerating(true);
        const element = document.getElementById('quote-template');
        if (!element) {
            setIsGenerating(false);
            return;
        }

        element.style.display = 'block';
        // Wait a bit for images and styles to load
        await new Promise(r => setTimeout(r, 500));

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
            element.style.display = 'none';

            if (type === 'pdf') {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Orcamento_${selectedQuote?.clientName}_${new Date().toLocaleDateString()}.pdf`);
            } else {
                const link = document.createElement('a');
                link.download = `Orcamento_${selectedQuote?.clientName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (err) {
            console.error('Export error:', err);
            alert('Erro ao gerar arquivo.');
            element.style.display = 'none';
        }
        setIsGenerating(false);
    };

    const confirmShare = () => {
        const phone = clients.find(c => c.id === selectedQuote?.clientId)?.phone || '';
        const encodedMsg = encodeURIComponent(customMessage);
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMsg}`, '_blank');
        setIsShareModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-6 lg:px-8 py-6 lg:py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-3 text-amber-500">
                        <span className="material-symbols-outlined font-black text-2xl lg:text-3xl">request_quote</span>
                        <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Orçamentos</h1>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-500 font-medium">Capture intenções de compra e gerencie propostas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 lg:py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined font-black">add</span>
                    <span>NOVO ORÇAMENTO</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
                <div className="relative w-full md:max-w-xl">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou descrição..."
                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#16212e] border border-slate-200 dark:border-slate-800 rounded-[24px] lg:rounded-[28px] text-sm font-bold shadow-sm focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white dark:bg-[#16212e] rounded-[28px] lg:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400 animate-pulse">Carregando propostas...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-8 py-5">Cliente</th>
                                        <th className="px-8 py-5">Descrição</th>
                                        <th className="px-8 py-5">Validade</th>
                                        <th className="px-8 py-5">Valor Total</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredQuotes.map(quote => (
                                        <tr key={quote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center font-black text-[10px]">
                                                        {quote.clientName?.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{quote.clientName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">{quote.description}</td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-bold">{quote.validUntil}</td>
                                            <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white">R$ {quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${quote.status === 'Rascunho' ? 'bg-slate-100 text-slate-500' :
                                                    quote.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-600' :
                                                        'bg-rose-100 text-rose-600'
                                                    }`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right space-x-2">
                                                <button onClick={() => handleShare(quote)} className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all" title="Enviar WhatsApp / PDF">
                                                    <span className="material-symbols-outlined text-xl">share</span>
                                                </button>
                                                {quote.status === 'Rascunho' && (
                                                    <button
                                                        onClick={() => convertToOrder(quote)}
                                                        disabled={converting === quote.id}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Converter em Pedido"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">{converting === quote.id ? 'sync' : 'shopping_cart_checkout'}</span>
                                                    </button>
                                                )}
                                                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><span className="material-symbols-outlined text-xl">edit</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Quote Creation */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#16212e] rounded-[48px] w-full max-w-2xl p-10 shadow-2xl border border-white/20 overflow-y-auto max-h-[90vh]">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Novo Orçamento</h3>
                        <form onSubmit={handleCreateQuote} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Cliente</label>
                                    <input
                                        required
                                        list="clients-list"
                                        placeholder="Digite o nome do cliente..."
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold shadow-sm focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                                        value={newQuote.clientSelector}
                                        onChange={e => setNewQuote({ ...newQuote, clientSelector: e.target.value })}
                                    />
                                    <datalist id="clients-list">
                                        {clients.map(c => <option key={c.id} value={c.name} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Validade</label>
                                    <input type="date" className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newQuote.valid_until} onChange={e => setNewQuote({ ...newQuote, valid_until: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Data do Evento</label>
                                    <input type="date" className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newQuote.event_date} onChange={e => setNewQuote({ ...newQuote, event_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tema</label>
                                    <input placeholder="Ex: Safari Baby" className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newQuote.theme} onChange={e => setNewQuote({ ...newQuote, theme: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Descrição Geral (Título)</label>
                                <input required placeholder="Ex: Kit Festa Personalizada" className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold" value={newQuote.description} onChange={e => setNewQuote({ ...newQuote, description: e.target.value })} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens do Orçamento</h4>
                                    <button type="button" onClick={addItem} className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">+ Adicionar Item</button>
                                </div>
                                <div className="space-y-3">
                                    {newQuote.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    list={`products-list-quote-${idx}`}
                                                    placeholder="Descrição..."
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
                                                <datalist id={`products-list-quote-${idx}`}>
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
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex justify-between items-center">
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Total do Orçamento</span>
                                <span className="text-2xl font-black text-amber-600">R$ {quoteSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl text-sm font-black text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black shadow-xl shadow-amber-500/30 transition-all active:scale-95">
                                    GERAR ORÇAMENTO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share & Export Modal */}
            {isShareModalOpen && selectedQuote && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#16212e] rounded-[48px] w-full max-w-lg p-10 shadow-2xl space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Compartilhar</h3>
                                <p className="text-xs text-slate-500 font-medium italic">Selecione o formato e configure a mensagem.</p>
                            </div>
                            <button onClick={() => setIsShareModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-3">
                                <button onClick={() => generateExport('image')} disabled={isGenerating} className="flex-1 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                                    <span className="material-symbols-outlined text-xl">image</span>
                                    {isGenerating ? 'GERANDO...' : 'IMAGEM'}
                                </button>
                                <button onClick={() => generateExport('pdf')} disabled={isGenerating} className="flex-1 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest border border-rose-100 dark:border-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                                    <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                                    {isGenerating ? 'GERANDO...' : 'PDF'}
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Mensagem do WhatsApp</label>
                                <textarea rows={4} className="w-full p-6 rounded-[32px] bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" value={customMessage} onChange={e => setCustomMessage(e.target.value)} />
                            </div>

                            <button onClick={confirmShare} className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-[#25D366]/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-xl">chat</span>
                                ENVIAR PARA WHATSAPP
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HIDDEN TEMPLATE FOR CAPTURE (matches inspiration) */}
            <div id="quote-template" style={{ display: 'none', position: 'absolute', left: '-9999px', width: '800px', backgroundColor: '#fff', padding: '60px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    {settings?.logoUrl && <img src={settings.logoUrl} style={{ maxHeight: '100px', marginBottom: '20px', display: 'inline-block' }} />}
                    <h1 style={{ color: '#6366f1', fontSize: '36px', fontWeight: '900', margin: '0', letterSpacing: '-1px' }}>{settings?.name || 'Sua Empresa'}</h1>
                    <h2 style={{ color: '#8b5cf6', fontSize: '24px', fontWeight: '700', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Orçamento</h2>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>ORC-{selectedQuote?.id.slice(0, 8).toUpperCase()}</p>
                </div>

                <div style={{ borderTop: '2px solid #f1f5f9', padding: '40px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div>
                        <h3 style={{ textTransform: 'uppercase', fontSize: '12px', color: '#94a3b8', fontWeight: '900', marginBottom: '15px' }}>📋 Dados do Orçamento</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>CLIENTE</span><br />
                            <strong style={{ fontSize: '20px', color: '#1e293b' }}>{selectedQuote?.clientName}</strong>
                        </div>
                        {selectedQuote?.eventDate && <div>
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>DATA DO EVENTO</span><br />
                            <strong style={{ fontSize: '18px', color: '#1e293b' }}>{selectedQuote.eventDate}</strong>
                        </div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>GERADO EM</span><br />
                            <strong style={{ fontSize: '18px', color: '#1e293b' }}>{new Date().toLocaleDateString()}</strong>
                        </div>
                        {selectedQuote?.theme && <div>
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>TEMA</span><br />
                            <strong style={{ fontSize: '18px', color: '#1e293b' }}>{selectedQuote.theme}</strong>
                        </div>}
                    </div>
                </div>

                <div style={{ margin: '40px 0' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '12px', color: '#94a3b8', fontWeight: '900', marginBottom: '20px' }}>🛒 Itens Orçados</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f3ff', textAlign: 'left' }}>
                                <th style={{ padding: '20px', color: '#8b5cf6', fontSize: '14px', borderRadius: '15px 0 0 15px' }}>Descrição</th>
                                <th style={{ padding: '20px', color: '#8b5cf6', fontSize: '14px', textAlign: 'center' }}>Qtde</th>
                                <th style={{ padding: '20px', color: '#8b5cf6', fontSize: '14px', textAlign: 'right', borderRadius: '0 15px 15px 0' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedQuote?.items && selectedQuote.items.length > 0 ? (
                                selectedQuote.items.map((item: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '2px solid #f1f5f9' }}>
                                        <td style={{ padding: '25px 20px', fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>{item.description}</td>
                                        <td style={{ padding: '25px 20px', fontSize: '16px', textAlign: 'center', color: '#334155' }}>{item.quantity}</td>
                                        <td style={{ padding: '25px 20px', fontSize: '16px', textAlign: 'right', color: '#10b981', fontWeight: '900' }}>R$ {(item.quantity * item.unitValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <td style={{ padding: '25px 20px', fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>{selectedQuote?.description}</td>
                                    <td style={{ padding: '25px 20px', fontSize: '16px', textAlign: 'center', color: '#334155' }}>1</td>
                                    <td style={{ padding: '25px 20px', fontSize: '16px', textAlign: 'right', color: '#10b981', fontWeight: '900' }}>R$ {selectedQuote?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '30px', padding: '40px', margin: '60px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: '#065f46' }}>VALOR TOTAL</span>
                    <span style={{ fontSize: '42px', fontWeight: '900', color: '#065f46' }}>R$ {selectedQuote?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '40px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
                    <div style={{ paddingLeft: '10px' }}>
                        <h3 style={{ textTransform: 'uppercase', fontSize: '12px', color: '#94a3b8', fontWeight: '900', marginBottom: '15px' }}>💳 Informações de Pagamento</h3>
                        <p style={{ fontSize: '16px', color: '#475569', margin: '10px 0', lineHeight: '1.6' }}>Para confirmar seu pedido e garantir sua vaga na agenda, realize o pagamento via <strong>PIX</strong>:</p>
                        <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '15px', display: 'inline-block', marginTop: '10px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#6366f1' }}>{settings?.pixKey || 'Chave não cadastrada'}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '30px', fontStyle: 'italic', fontWeight: 'bold' }}>⏰ Este orçamento é válido por 7 dias a partir da data de geração.</p>
                    </div>
                    {settings?.pixKey && (
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'center' }}>
                                <QRCodeSVG
                                    value={generatePixCopyPaste(
                                        settings.pixKey,
                                        settings.name || 'Loja',
                                        'Cidade',
                                        selectedQuote?.value?.toFixed(2) || '0.00',
                                        selectedQuote?.id?.slice(0, 20)
                                    )}
                                    size={180}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px' }}>Gerado por PapelariaSys</p>
                </div>
            </div>
        </div>
    );
};

export default Quotes;
