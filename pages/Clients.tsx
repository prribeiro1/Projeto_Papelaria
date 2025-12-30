import React, { useState } from 'react';
import { useClients } from '../hooks/useData';
import { supabase } from '../supabaseClient';

const Clients: React.FC = () => {
  const { clients, loading, refresh } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [addingClient, setAddingClient] = useState(false);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingClient(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('clients').insert([{
      ...newClient,
      user_id: user.id,
      status: 'Novo'
    }]);

    if (error) {
      alert('Erro ao criar cliente: ' + error.message);
    } else {
      setIsModalOpen(false);
      setNewClient({ name: '', email: '', phone: '', address: '' });
      refresh();
    }
    setAddingClient(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-emerald-500">
              <span className="material-symbols-outlined font-black text-3xl">group</span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Base de Clientes</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">Gerencie o relacionamento e histórico de seus clientes</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              <span>Exportar</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined font-black">person_add</span>
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>
      </header>

      {/* List & Search */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-xl">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#16212e] border border-slate-200 dark:border-slate-800 rounded-[28px] text-sm font-bold shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por Status:</span>
            <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-[10px] font-black uppercase text-emerald-500 shadow-sm transition-all text-xs">Todos</button>
              <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-slate-700 transition-all text-xs">VIP</button>
              <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-slate-700 transition-all text-xs">Ativos</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Carregando contatos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map(client => (
              <div key={client.id} className="bg-white dark:bg-[#16212e] p-7 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-slate-300 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
                <div className="size-20 rounded-[32px] bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 flex items-center justify-center text-2xl font-black mb-5 border border-emerald-100 dark:border-emerald-900/20 group-hover:scale-110 transition-transform">
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 group-hover:text-emerald-500 transition-colors line-clamp-1">{client.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Desde {new Date().getFullYear()}</p>

                <div className="w-full space-y-3 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">{client.email || 'Não informado'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-lg">call</span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">{client.phone || 'Não informado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 w-full gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex flex-col items-center border-r border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Gasto</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">R$ {(client.totalSpent || 0).toFixed(0)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pedidos</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{client.orderCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#16212e] rounded-[48px] w-full max-w-lg p-10 shadow-2xl border border-white/20">
            <div className="flex items-center gap-5 mb-10">
              <div className="size-14 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <span className="material-symbols-outlined text-3xl font-black">person_add</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Cadastrar Cliente</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Formulário de Relacionamento</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Nome Completo *</label>
                <input required placeholder="Ex: João da Silva" className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">E-mail</label>
                  <input type="email" placeholder="email@exemplo.com" className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Telefone / WhatsApp</label>
                  <input placeholder="(11) 99999-9999" className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-black focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Endereço de Entrega</label>
                <input placeholder="Rua, Número, Bairro, Cidade..." className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} />
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl text-sm font-black text-slate-400 hover:text-slate-600 transition-all">Descartar</button>
                <button type="submit" disabled={addingClient} className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black shadow-xl shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50">
                  {addingClient ? 'PROCESSANDO...' : 'CADASTRAR CLIENTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
