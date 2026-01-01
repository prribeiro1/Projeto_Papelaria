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
    const [uploading, setUploading] = useState(false);

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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setUploading(false);
            return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, file);

        if (uploadError) {
            alert('Erro ao fazer upload: ' + uploadError.message);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, logo_url: publicUrl }));
        }
        setUploading(false);
    };

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
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-6 lg:px-8 py-6 lg:py-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-3 text-primary">
                        <span className="material-symbols-outlined font-black text-2xl lg:text-3xl">settings</span>
                        <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h1>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-500 font-medium">Personalize a identidade da sua empresa e documentos</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex justify-center">
                <div className="w-full max-w-3xl space-y-8 lg:space-y-10">
                    {/* Perfil Pessoal */}
                    <section className="bg-white dark:bg-[#16212e] rounded-[32px] lg:rounded-[48px] p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-10 lg:size-12 rounded-xl lg:rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h2 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white">Seu Perfil</h2>
                        </div>

                        <ProfileSection />
                    </section>

                    <section className="bg-white dark:bg-[#16212e] rounded-[32px] lg:rounded-[48px] p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-8 lg:mb-10">
                            <div className="size-10 lg:size-12 rounded-xl lg:rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined">business</span>
                            </div>
                            <h2 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white">Identidade do Negócio</h2>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Logomarca da Empresa</label>
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative size-32 rounded-[28px] lg:rounded-[32px] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden group">
                                            {formData.logo_url ? (
                                                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-3 items-center sm:items-start text-center sm:text-left">
                                            <label className="w-full sm:w-auto cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-center">
                                                {uploading ? 'ENVIANDO...' : 'FAZER UPLOAD'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                            </label>
                                            <p className="text-[10px] text-slate-400 font-medium max-w-[200px]">Recomendado: PNG com fundo transparente. Aparecerá em todos os seus documentos.</p>
                                        </div>
                                    </div>
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
                                <button type="submit" disabled={saving} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
                                    {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="bg-white dark:bg-[#16212e] rounded-[32px] lg:rounded-[48px] p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
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
const ProfileSection: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const { profile, refresh } = React.useMemo(() => {
        // We use a dummy hook call or just inline the logic to avoid complex state management
        // but for simplicity, let's just use the profile directly if we had a global context.
        // Since we don't, we'll fetch it locally.
        return { profile: null as any, refresh: () => { } };
    }, []);

    const [fullName, setFullName] = useState('');
    const [saving, setSaving] = useState(false);
    const [localProfile, setLocalProfile] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user?.id) {
                supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
                    if (data) {
                        setLocalProfile(data);
                        setFullName(data.full_name || '');
                    }
                });
            }
        });
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', session.user.id);

        if (error) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } else {
            alert('Perfil atualizado com sucesso!');
        }
        setSaving(false);
    };

    return (
        <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Como deseja ser chamado?</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        required
                        placeholder="Ex: Seu Nome ou Apelido"
                        className="flex-1 h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs lg:text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'SALVANDO...' : 'ATUALIZAR NOME'}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 ml-1">Esse nome será exibido na tela inicial e nas notificações do sistema.</p>
            </div>
        </form>
    );
};

export default Settings;
