import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Production from './pages/Production';
import Clients from './pages/Clients';
import Financeiro from './pages/Financeiro';
import Despesas from './pages/Despesas';
import Auth from './pages/Auth';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

// Componentes Placeholder para novas páginas (para evitar arquivos vazios)
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400">
      <span className="material-symbols-outlined text-6xl mb-4">construction</span>
      <p>A aba "{title}" está sendo populada com seus dados reais.</p>
    </div>
  </div>
);

const Sidebar = ({ session }: { session: Session | null }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { path: '/', label: 'Início', icon: 'dashboard' },
        { path: '/pedidos', label: 'Pedidos', icon: 'shopping_bag' },
        { path: '/orcamentos', label: 'Orçamentos', icon: 'request_quote' },
        { path: '/producao', label: 'Produção', icon: 'layers', badge: '8' },
      ]
    },
    {
      title: 'Gestão Financeira',
      items: [
        { path: '/financeiro', label: 'Financeiro', icon: 'account_balance_wallet' },
        { path: '/despesas', label: 'Despesas', icon: 'trending_down' },
        { path: '/pro-labore', label: 'Pró-labore', icon: 'payments' },
      ]
    },
    {
      title: 'Administrativo',
      items: [
        { path: '/clientes', label: 'Clientes', icon: 'group' },
        { path: '/produtos', label: 'Produtos', icon: 'inventory_2' },
        { path: '/backup', label: 'Backup', icon: 'cloud_sync' },
        { path: '/configuracao', label: 'Configuração', icon: 'settings' },
      ]
    }
  ];

  return (
    <div className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#111a27] border-r border-slate-200 dark:border-slate-800 h-full flex-none overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-2 flex items-center justify-center size-10 text-white shadow-xl shadow-primary/20">
            <span className="material-symbols-outlined font-black text-2xl">print</span>
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-xl font-black tracking-tight leading-none">PAPELARIA<span className="text-primary">SYS</span></h1>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business Suite</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 px-6 py-8 grow overflow-y-auto custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{section.title}</h3>
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${isActive(item.path)
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${isActive(item.path) ? 'icon-filled' : 'opacity-70 group-hover:opacity-100 transition-opacity'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive(item.path) ? 'font-black' : 'font-bold'}`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg ${isActive(item.path) ? 'bg-white/20 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="bg-white dark:bg-[#16212e] rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/10">
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-slate-900 dark:text-white text-xs font-black truncate">{session?.user?.email?.split('@')[0]}</p>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
            title="Sair"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
        {session && <Sidebar session={session} />}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <Routes>
            <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
            <Route path="/" element={session ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/pedidos" element={session ? <Orders /> : <Navigate to="/auth" />} />
            <Route path="/producao" element={session ? <Production /> : <Navigate to="/auth" />} />
            <Route path="/clientes" element={session ? <Clients /> : <Navigate to="/auth" />} />
            <Route path="/orcamentos" element={session ? <Placeholder title="Orçamentos" /> : <Navigate to="/auth" />} />
            <Route path="/financeiro" element={session ? <Financeiro /> : <Navigate to="/auth" />} />
            <Route path="/despesas" element={session ? <Despesas /> : <Navigate to="/auth" />} />
            <Route path="/pro-labore" element={session ? <Placeholder title="Pró-labore" /> : <Navigate to="/auth" />} />
            <Route path="/produtos" element={session ? <Placeholder title="Produtos" /> : <Navigate to="/auth" />} />
            <Route path="/backup" element={session ? <Placeholder title="Backup" /> : <Navigate to="/auth" />} />
            <Route path="/configuracao" element={session ? <Placeholder title="Configuração" /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
