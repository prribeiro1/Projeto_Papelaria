import React, { useState } from 'react';
import { exportAllData, importAllData } from '../hooks/useData';

const Backup: React.FC = () => {
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', msg: string }>({ type: 'none', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        setStatus({ type: 'none', msg: '' });
        try {
            const data = await exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_proativx_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            setStatus({ type: 'success', msg: 'Backup exportado com sucesso!' });
        } catch (error: any) {
            setStatus({ type: 'error', msg: 'Erro ao exportar backup: ' + error.message });
        }
        setLoading(false);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('ATENÇÃO: A importação pode sobrescrever dados existentes com o mesmo ID. Deseja continuar?')) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        setStatus({ type: 'none', msg: '' });
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                await importAllData(data);
                setStatus({ type: 'success', msg: 'Backup importado com sucesso! Recarregue a página para ver as mudanças.' });
            } catch (error: any) {
                setStatus({ type: 'error', msg: 'Erro ao importar backup: ' + error.message });
            }
            setLoading(false);
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined font-bold">cloud_sync</span>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Backup e Restauração</h2>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Proteja seus dados e mova seus registros</p>
                </div>
            </header>

            <main className="flex-1 p-8 flex flex-col gap-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Export Section */}
                    <div className="bg-white dark:bg-[#16212e] p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-6">
                        <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">download_for_offline</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Exportar Dados</h3>
                            <p className="text-sm text-slate-500 font-medium">Baixe uma cópia completa de todos os seus registros (clientes, pedidos, orçamentos, produtos e despesas) em formato JSON.</p>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? 'PROCESSANDO...' : 'EXPORTAR AGORA'}
                        </button>
                    </div>

                    {/* Import Section */}
                    <div className="bg-white dark:bg-[#16212e] p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-6">
                        <div className="size-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">upload_file</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Importar Backup</h3>
                            <p className="text-sm text-slate-500 font-medium">Restaure seus dados a partir de um arquivo JSON exportado anteriormente. Isso irá sincronizar os dados com sua conta atual.</p>
                        </div>
                        <label className="w-full">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                disabled={loading}
                                className="hidden"
                            />
                            <div className="w-full h-14 bg-slate-900 dark:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10">
                                {loading ? 'PROCESSANDO...' : 'SELECIONAR ARQUIVO'}
                            </div>
                        </label>
                    </div>
                </div>

                {status.type !== 'none' && (
                    <div className={`p-6 rounded-[32px] border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600'
                            : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20 text-rose-600'
                        }`}>
                        <span className="material-symbols-outlined">
                            {status.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className="text-sm font-bold">{status.msg}</p>
                    </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[40px] border border-amber-100 dark:border-amber-900/20 flex gap-6 mt-4">
                    <span className="material-symbols-outlined text-amber-500 text-3xl">info</span>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-black text-amber-600 uppercase tracking-wider">Segurança dos Dados</h4>
                        <p className="text-sm text-amber-700/70 font-medium leading-relaxed">
                            Seus dados estão salvos na nuvem vinculados ao seu usuário. O backup manual é uma camada extra de segurança para que você possa ter controle total sobre suas informações fora da plataforma.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Backup;
