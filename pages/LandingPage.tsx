import React, { useState, useEffect } from 'react';

const LandingPage: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: 'shopping_bag',
            title: 'Gestão de Pedidos',
            description: 'Controle completo dos pedidos com status, prazos e valores. Nunca mais perca uma entrega.',
            color: 'bg-primary'
        },
        {
            icon: 'request_quote',
            title: 'Orçamentos Profissionais',
            description: 'Crie orçamentos elegantes em segundos e envie direto pelo WhatsApp com 1 clique.',
            color: 'bg-emerald-500'
        },
        {
            icon: 'calendar_month',
            title: 'Calendário de Produção',
            description: 'Visualize todos os prazos em um calendário interativo. Kanban integrado para organização.',
            color: 'bg-amber-500'
        },
        {
            icon: 'account_balance_wallet',
            title: 'Controle Financeiro',
            description: 'Entradas, saídas, lucro real e inadimplência. Tudo em um painel simples e visual.',
            color: 'bg-purple-500'
        },
        {
            icon: 'group',
            title: 'Gestão de Clientes',
            description: 'Histórico completo de cada cliente, total gasto e status de relacionamento.',
            color: 'bg-rose-500'
        },
        {
            icon: 'notifications_active',
            title: 'Alertas Automáticos',
            description: 'Receba notificações no navegador quando um prazo estiver próximo ou vencido.',
            color: 'bg-sky-500'
        },
        {
            icon: 'pix',
            title: 'Pagamento com Pix',
            description: 'Gere QR Codes Pix automaticamente para seus clientes pagarem na hora.',
            color: 'bg-teal-500'
        },
        {
            icon: 'cloud_sync',
            title: 'Backup na Nuvem',
            description: 'Seus dados seguros e sincronizados. Acesse de qualquer lugar, a qualquer hora.',
            color: 'bg-indigo-500'
        }
    ];

    const benefits = [
        { icon: 'schedule', text: 'Economize horas de trabalho toda semana' },
        { icon: 'trending_up', text: 'Aumente seu faturamento com organização' },
        { icon: 'sentiment_satisfied', text: 'Surpreenda clientes com profissionalismo' },
        { icon: 'devices', text: 'Acesse do celular, tablet ou computador' },
        { icon: 'lock', text: 'Dados protegidos com criptografia' },
        { icon: 'support_agent', text: 'Suporte humanizado via WhatsApp' }
    ];

    const faqs = [
        {
            question: 'Posso testar antes de assinar?',
            answer: 'Sim! Entre em contato pelo WhatsApp e liberamos um período de teste gratuito para você conhecer todas as funcionalidades.'
        },
        {
            question: 'Como funciona o pagamento?',
            answer: 'Você pode pagar via cartão de crédito (renovação automática) ou Pix (liberação manual). Aceitamos todas as bandeiras.'
        },
        {
            question: 'Posso cancelar a qualquer momento?',
            answer: 'Sim, sem multas ou burocracia. Você pode cancelar diretamente pelo painel ou falar conosco pelo WhatsApp.'
        },
        {
            question: 'Meus dados ficam salvos se eu cancelar?',
            answer: 'Sim, mantemos seus dados por 30 dias após o cancelamento. Se voltar, está tudo lá.'
        },
        {
            question: 'Funciona no celular?',
            answer: 'Sim! O PROATIVX é um PWA (Progressive Web App). Você pode instalar no celular como se fosse um aplicativo nativo.'
        },
        {
            question: 'Serve para meu tipo de negócio?',
            answer: 'Se você trabalha com produção sob demanda, prazos e clientes, provavelmente sim! Papelarias, gráficas, decoradores, bordados, estamparias e muito mais.'
        }
    ];

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FFFDF8] text-slate-900 font-sans antialiased overflow-x-hidden">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-900/5' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="PROATIVX" className="h-12 w-12 object-contain" />
                            <span className="text-2xl font-black italic tracking-tighter text-primary">PRO<span className="text-secondary">ATIVX</span></span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-8">
                            <button onClick={() => scrollToSection('funcionalidades')} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Funcionalidades</button>
                            <button onClick={() => scrollToSection('precos')} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Preços</button>
                            <button onClick={() => scrollToSection('faq')} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">FAQ</button>
                            <a href="/#/auth" className="px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                                ENTRAR NO SISTEMA
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden size-12 rounded-xl bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-4 animate-in slide-in-from-top duration-200">
                        <button onClick={() => scrollToSection('funcionalidades')} className="block w-full text-left text-sm font-bold text-slate-600 py-3">Funcionalidades</button>
                        <button onClick={() => scrollToSection('precos')} className="block w-full text-left text-sm font-bold text-slate-600 py-3">Preços</button>
                        <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-sm font-bold text-slate-600 py-3">FAQ</button>
                        <a href="/#/auth" className="block w-full text-center px-6 py-4 bg-primary text-white text-sm font-black rounded-xl">ENTRAR NO SISTEMA</a>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 lg:px-8 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-6">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Sistema Profissional de Gestão
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                                Chega de <span className="text-primary italic">planilhas</span> e{' '}
                                <span className="text-secondary italic">desorganização</span>.
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-600 font-medium mb-8 max-w-xl mx-auto lg:mx-0">
                                O <strong className="text-primary">PROATIVX</strong> é o sistema tudo-em-um para gerenciar pedidos, clientes, produção e finanças do seu negócio criativo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <a href="/#/auth" className="px-8 py-4 bg-primary hover:bg-primary/90 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                    COMEÇAR AGORA
                                </a>
                                <button onClick={() => scrollToSection('funcionalidades')} className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black uppercase tracking-wider rounded-2xl shadow-lg border border-slate-200 transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">play_circle</span>
                                    VER COMO FUNCIONA
                                </button>
                            </div>
                            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-slate-500 font-medium">
                                {/* Removido: Teste grátis, Sem cartão, Cancele quando quiser */}
                            </div>
                        </div>

                        {/* Hero Image/Mockup */}
                        <div className="relative">
                            <div className="relative bg-white rounded-[32px] shadow-2xl shadow-slate-900/10 border border-slate-200/50 overflow-hidden">
                                <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="size-3 rounded-full bg-rose-400"></div>
                                        <div className="size-3 rounded-full bg-amber-400"></div>
                                        <div className="size-3 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold ml-2">proativx.vercel.app</span>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-[#F2E8CF] to-[#E8DFC5] min-h-[300px] lg:min-h-[400px] flex items-center justify-center">
                                    <div className="text-center">
                                        <img src="/logo.png" alt="PROATIVX Dashboard" className="w-32 h-32 mx-auto mb-4 opacity-50" />
                                        <p className="text-sm text-slate-500 font-bold">Preview do Dashboard</p>
                                    </div>
                                </div>
                            </div>
                            {/* Removido: Cards flutuantes de Lucro e Prazo */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Logos/Social Proof */}
            <section className="py-12 border-y border-secondary/10 bg-secondary/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <p className="text-center text-xs font-black text-secondary uppercase tracking-[0.2em] mb-8">Para quem é o PROATIVX?</p>
                    <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
                        {['Papelarias', 'Gráficas', 'Decoradores', 'Bordados', 'Estamparias', 'Personalizados'].map((item, i) => (
                            <span key={i} className="text-sm lg:text-base font-black px-6 py-3 bg-white text-secondary border-2 border-secondary/20 rounded-2xl shadow-sm hover:border-secondary hover:shadow-md transition-all">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="funcionalidades" className="py-20 lg:py-32 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Funcionalidades</span>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mt-4 mb-6">
                            Tudo o que você precisa,<br /><span className="text-primary italic">em um só lugar</span>.
                        </h2>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                            Deixe as planilhas de lado. O PROATIVX centraliza toda a gestão do seu negócio em uma plataforma simples e bonita.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className="group p-6 bg-white rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all hover:-translate-y-1 cursor-default">
                                <div className={`size-14 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 lg:py-32 px-6 lg:px-8 bg-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16 lg:mb-20">
                        <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">Por que o PROATIVX?</span>
                        <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                            O ponto <span className="text-[#F2E8CF] italic">inicial</span> e <span className="text-[#F2E8CF] italic">final</span><br />do seu processo.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="group flex flex-col items-center text-center p-10 bg-white rounded-[40px] shadow-2xl shadow-slate-900/20 hover:-translate-y-2 transition-all duration-300">
                                <div className="size-16 rounded-[24px] bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-3xl font-bold">{benefit.icon}</span>
                                </div>
                                <span className="text-xl font-black text-slate-900 leading-snug">{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precos" className="py-20 lg:py-32 px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Preços</span>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mt-4 mb-6">
                            Simples e <span className="text-primary italic">acessível</span>.
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            Um único plano com tudo incluso. Sem surpresas, sem taxas escondidas.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {/* Monthly Plan */}
                        <div className="p-8 bg-white rounded-[32px] border-2 border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                            <div className="mb-6">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Mensal</span>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl lg:text-5xl font-black text-slate-900">R$ 14,90</span>
                                    <span className="text-slate-400 font-bold">/mês</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {['Acesso completo ao sistema', 'Pedidos, clientes e finanças', 'Backup automático na nuvem', 'Suporte via WhatsApp'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a href="https://buy.stripe.com/bJe5kE8a0enY6Ts3lzbwk04" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-sm font-black uppercase tracking-wider rounded-2xl transition-all text-center">
                                ASSINAR MENSAL
                            </a>
                        </div>

                        {/* Annual Plan */}
                        <div className="p-8 bg-white rounded-[32px] border-2 border-primary shadow-xl shadow-primary/10 relative group">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                ECONOMIZE 20%
                            </div>
                            <div className="mb-6">
                                <span className="text-xs font-black text-primary uppercase tracking-widest">Anual</span>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl lg:text-5xl font-black text-slate-900">R$ 149</span>
                                    <span className="text-slate-400 font-bold">/ano</span>
                                </div>
                                <p className="text-xs text-slate-400 font-bold mt-1">Equivale a R$ 12,41/mês</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {['Tudo do plano mensal', '2 meses grátis', 'Prioridade no suporte', 'Acesso antecipado a novidades'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a href="https://buy.stripe.com/aFaeVegGwa7Ib9I8FTbwk05" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-primary hover:bg-primary/90 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/20 transition-all text-center">
                                ASSINAR ANUAL
                            </a>
                        </div>
                    </div>

                    {/* Removido: Prefere pagar via Pix? */}
                </div>
            </section>

            {/* Testimonials Placeholder */}
            <section className="py-20 lg:py-32 px-6 lg:px-8 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Depoimentos</span>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mt-4 mb-6">
                            O que nossos clientes <span className="text-primary italic">dizem</span>.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="p-8 bg-white rounded-3xl border border-slate-200/50 shadow-sm">
                                <div className="flex items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className="material-symbols-outlined text-amber-400 text-lg icon-filled">star</span>
                                    ))}
                                </div>
                                <p className="text-slate-600 font-medium mb-6 italic">"Em breve você verá aqui depoimentos reais de clientes satisfeitos com o PROATIVX."</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">Cliente PROATIVX</p>
                                        <p className="text-xs text-slate-400 font-bold">Em breve</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 lg:py-32 px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">FAQ</span>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mt-4">
                            Perguntas <span className="text-primary italic">frequentes</span>.
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className="w-full p-6 flex items-center justify-between text-left"
                                >
                                    <span className="font-black text-slate-900">{faq.question}</span>
                                    <span className={`material-symbols-outlined text-primary transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                {activeFaq === i && (
                                    <div className="px-6 pb-6 text-slate-600 font-medium animate-in slide-in-from-top-2 duration-200">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 lg:py-32 px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-6">
                        Pronto para <span className="text-primary italic">transformar</span><br />seu negócio?
                    </h2>
                    <p className="text-lg text-slate-400 font-medium mb-8 max-w-xl mx-auto">
                        Junte-se a centenas de empreendedores que já organizaram suas empresas com o PROATIVX.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#/auth" className="px-8 py-4 bg-primary hover:bg-primary/90 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">rocket_launch</span>
                            CRIAR MINHA CONTA GRÁTIS
                        </a>
                        <a href="https://wa.me/5522999298128?text=Olá! Tenho dúvidas sobre o PROATIVX." target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-sm font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">chat</span>
                            FALAR NO WHATSAPP
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 lg:px-8 bg-slate-900 text-slate-400">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="PROATIVX" className="h-10 w-10 object-contain opacity-50" />
                            <span className="text-xl font-black italic tracking-tighter text-white/50">PRO<span className="text-secondary/50">ATIVX</span></span>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-bold">
                            <a href="https://wa.me/5522999298128" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Suporte</a>
                            <a href="/#/auth" className="hover:text-white transition-colors">Login</a>
                        </div>
                        <p className="text-xs font-medium">© 2026 PROATIVX. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/5522999298128?text=Olá! Vim pela landing page do PROATIVX e tenho interesse!"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 size-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
                <span className="material-symbols-outlined text-2xl">chat</span>
            </a>

            {/* Custom Styles */}
            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                .icon-filled {
                    font-variation-settings: 'FILL' 1;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
