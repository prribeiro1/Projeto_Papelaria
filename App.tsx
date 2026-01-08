import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Production from './pages/Production';
import Clients from './pages/Clients';
import Financeiro from './pages/Financeiro';
import Despesas from './pages/Despesas';
import Metas from './pages/Metas';
import Auth from './pages/Auth';
import Quotes from './pages/Quotes';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Backup from './pages/Backup';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionGuard from './components/SubscriptionGuard';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useProfile, useOrders } from './hooks/useData';
import { useWebNotifications } from './hooks/useWebNotifications';

const NotificationManager = ({ session }: { session: Session | null }) => {
  const { orders } = useOrders();
  const { checkDeadlines } = useWebNotifications();

  useEffect(() => {
    if (session && orders.length > 0) {
      checkDeadlines(orders);
    }
  }, [session, orders, checkDeadlines]);

  return null;
};

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

const Sidebar = ({ session, profile, isOpen, onClose }: { session: Session | null, profile: any, isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const appNameSuffix = profile?.gender === 'male' ? 'O' : profile?.gender === 'female' ? 'A' : 'X';

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { path: '/', label: 'Início', icon: 'dashboard' },
        { path: '/pedidos', label: 'Pedidos', icon: 'shopping_bag' },
        { path: '/orcamentos', label: 'Orçamentos', icon: 'request_quote' },
        { path: '/producao', label: 'Produção', icon: 'layers' },
      ]
    },
    {
      title: 'Gestão Financeira',
      items: [
        { path: '/financeiro', label: 'Financeiro', icon: 'account_balance_wallet' },
        { path: '/despesas', label: 'Despesas', icon: 'trending_down' },
        { path: '/metas', label: 'Metas', icon: 'flag' },
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
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#111a27] border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full flex-none`}>
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-20 rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="PROATIVX Logo" className="w-full h-full object-contain scale-110" />
            </div>
            <div>
              <h1 className="text-primary text-2xl font-black tracking-tighter leading-none italic">PRO<span className="text-secondary">ATIV{appNameSuffix}</span></h1>
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
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
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
                  {(item as any).badge && (
                    <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg ${isActive(item.path) ? 'bg-white/20 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      }`}>
                      {(item as any).badge}
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
                <p className="text-slate-900 dark:text-white text-xs font-black truncate">
                  {profile?.full_name || session?.user?.email?.split('@')[0]}
                </p>
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
    </>
  );
};

const MobileHeader = ({ onOpen, session, profile }: { onOpen: () => void, session: Session | null, profile: any }) => {
  const appNameSuffix = profile?.gender === 'male' ? 'O' : profile?.gender === 'female' ? 'A' : 'X';

  return (
    <div className="lg:hidden h-16 bg-white dark:bg-[#111a27] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-primary text-lg font-black tracking-tighter italic">PRO<span className="text-secondary">ATIV{appNameSuffix}</span></h1>
      </div>
      <button
        onClick={onOpen}
        className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
    </div>
  );
}

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useProfile(session);
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
      <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex flex-col lg:flex-row min-h-screen w-full bg-background-light dark:bg-background-dark">
        {session && <Sidebar session={session} profile={profile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {session && <NotificationManager session={session} />}
        <main className="flex-1 flex flex-col min-w-0">
          {session && <MobileHeader onOpen={() => setSidebarOpen(true)} session={session} profile={profile} />}
          <div className="flex-1">
            <Routes>
              {/* ... same routes ... */}
              <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
              <Route path="/" element={session ? (
                <SubscriptionGuard session={session}>
                  <Dashboard />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/pedidos" element={session ? (
                <SubscriptionGuard session={session}>
                  <Orders />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/producao" element={session ? (
                <SubscriptionGuard session={session}>
                  <Production />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/clientes" element={session ? (
                <SubscriptionGuard session={session}>
                  <Clients />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/orcamentos" element={session ? (
                <SubscriptionGuard session={session}>
                  <Quotes />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/financeiro" element={session ? (
                <SubscriptionGuard session={session}>
                  <Financeiro />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/despesas" element={session ? (
                <SubscriptionGuard session={session}>
                  <Despesas />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/metas" element={session ? (
                <SubscriptionGuard session={session}>
                  <Metas />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/produtos" element={session ? (
                <SubscriptionGuard session={session}>
                  <Products />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/backup" element={session ? (
                <SubscriptionGuard session={session}>
                  <Backup />
                </SubscriptionGuard>
              ) : <Navigate to="/auth" />} />
              <Route path="/configuracao" element={session ? <Settings /> : <Navigate to="/auth" />} />
              <Route path="/assinatura" element={session ? <SubscriptionPage /> : <Navigate to="/auth" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
