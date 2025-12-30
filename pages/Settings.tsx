import React, { useState, useEffect } from 'react';
import { useCompanySettings } from '../hooks/useData';
import { supabase } from '../supabaseClient';

const Settings: React.FC = () => {
    const { settings, loading, refresh } = useCompanySettings();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        logo_url: '',
        pix_key: '',
        quote_message_template: ''
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                name: settings.name || '',
                phone: settings.phone || '',
                email: settings.email || '',
                address: settings.address || '',
                logo_url: settings.logoUrl || '',
                pix_key: settings.pixKey || '',
                quote_message_template: settings.quoteMessageTemplate || 'Olá {{clientName}}! Segue em anexo o orçamento: *{{description}}* no valor de *R$ {{total}}*. Aguardamos sua confirmação!'
            });
        }
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            ...formData,
            user_id: user.id,
            updated_at: new Date().toISOString()
        };

        let error;
        if (settings?.id) {
            const { error: err } = await supabase
                .from('company_settings')
                .update(payload)
                .eq('id', settings.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('company_settings')
                .insert([payload]);
            error = err;
        }

        if (error) alert('Erro ao salvar: ' + error.message);
        else {
            alert('Configurações salvas com sucesso!');
            refresh();
        }
        setSaving(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-primary">
                        <span className="material-symbols-outlined font-black text-3xl">settings</span>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Personalize a identidade da sua empresa e documentos</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 flex justify-center">
                <div className="w-full max-w-3xl space-y-10">
                    <section className="bg-white dark:bg-[#16212e] rounded-[48px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined">business</span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white">Identidade do Negócio</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Nome da Empresa / Logo Marca *</label>
                                    <input required className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Telefone Comercial</label>
                                    <input placeholder="(11) 99999-9999" className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">E-mail de Contato</label>
                                    <input type="email" placeholder="contato@empresa.com" className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Endereço Comercial</label>
                                    <input placeholder="Rua, Número, Bairro, Cidade - Estado" className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">URL da Logomarca (PNG/JPG)</label>
                                    <div className="flex gap-4">
                                        <input placeholder="https://..." className="flex-1 h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} />
                                        {formData.logo_url && (
                                            <div className="size-14 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
                                                <img src={formData.logo_url} alt="Preview" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 ml-1">Aparecerá nos recibos em PDF e orçamentos.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Chave PIX para Recebimentos</label>
                                    <input placeholder="E-mail, CPF, CNPJ ou Chave Aleatória" className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={formData.pix_key} onChange={e => setFormData({ ...formData, pix_key: e.target.value })} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Modelo de Mensagem WhatsApp (Orçamentos)</label>
                                    <textarea rows={3} className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" value={formData.quote_message_template} onChange={e => setFormData({ ...formData, quote_message_template: e.target.value })} />
                                    <p className="text-[10px] text-slate-400 mt-2 ml-1">Use <code className="text-primary font-black">{"{{clientName}}"}</code>, <code className="text-primary font-black">{"{{description}}"}</code>, <code className="text-primary font-black">{"{{total}}"}</code> e <code className="text-primary font-black">{"{{pixKey}}"}</code> como variáveis.</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
                                    {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="bg-white dark:bg-[#16212e] rounded-[48px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                        <div className="flex items-center gap-4 mb-4 text-amber-500">
                            <span className="material-symbols-outlined">security</span>
                            <h2 className="text-xl font-black">Planos e Faturamento</h2>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Você está utilizando a versão <span className="text-primary font-bold">Enterprise</span> personalizada para Papelarias. Todos os recursos de BI e automação estão desbloqueados.</p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Settings;
