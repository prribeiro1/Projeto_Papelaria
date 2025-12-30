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
      user_id: user.id
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
    <div className="flex flex-col h-full">
      <header className="bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Lista de Clientes</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie sua base de clientes e históricos de compras</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors" onClick={() => setIsModalOpen(true)}>
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Novo Cliente</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <label className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                <input
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary/50"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16212e] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Carregando clientes...</div>
              ) : filteredClients.length === 0 ? (
                <div className="p-12 text-center text-slate-500">Nenhum cliente encontrado.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[250px]">Nome do Cliente</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Endereço</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Histórico</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{client.name}</p>
                              <p className="text-[10px] text-slate-500">ID: {client.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                              {client.email || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">call</span>
                              {client.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{client.address || 'Sem endereço'}</p>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">R$ {(client.totalSpent || 0).toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{client.orderCount || 0} pedidos</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${client.status === 'VIP' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
                            {client.status || 'Ativo'}
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
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Novo Cliente</h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                  <input
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={newClient.phone}
                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                  <input
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={newClient.address}
                    onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                  />
                </div>
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
                  disabled={addingClient}
                  className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  {addingClient ? 'Salvando...' : 'Salvar Cliente'}
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
