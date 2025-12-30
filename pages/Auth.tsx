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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                width: '100%',
                maxWidth: '400px',
                backdropFilter: 'blur(10px)'
            }}>
                <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '2rem' }}>
                    {isLogin ? 'Login - Papelaria' : 'Criar Conta'}
                </h2>

                <form onSubmit={handleAuth}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Senha</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#764ba2',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                    </button>

                    {message && (
                        <p style={{
                            marginTop: '1.5rem',
                            textAlign: 'center',
                            color: message.type === 'error' ? '#e53e3e' : '#38a169',
                            fontSize: '0.9rem'
                        }}>
                            {message.text}
                        </p>
                    )}

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'none', border: 'none', color: '#764ba2', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Ainda não tem conta? Cadastrar' : 'Já tem conta? Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
