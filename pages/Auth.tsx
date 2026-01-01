import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            if (isLogin) {
                navigate('/');
            } else {
                setMessage({ type: 'success', text: 'Confirme seu e-mail para continuar!' });
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-6 font-sans">
            <div className="bg-white dark:bg-[#16212e] p-12 rounded-[48px] w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 size-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform"></div>
                <div className="absolute bottom-0 left-0 size-32 bg-secondary/5 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform"></div>

                <div className="flex flex-col items-center mb-10 relative z-10">
                    <div className="size-24 rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="PROATIVX Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                    </h2>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">
                        {isLogin ? 'PROATIVX Business Suite' : 'Comece sua jornada hoje'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">E-mail</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">mail</span>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Senha</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">lock</span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR AGORA' : 'CRIAR MINHA CONTA')}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest ${message.type === 'error' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="pt-6 text-center border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                        >
                            {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já possui conta? Faça login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
