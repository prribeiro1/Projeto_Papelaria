import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Order, Transaction, Quote, CompanySettings } from '../types';

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchClients() {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*, orders(id, value, status)')
            .order('name', { ascending: true });

        if (error) console.error('Error fetching clients:', error);
        else {
            const mappedClients = (data || []).map(client => ({
                ...client,
                totalSpent: (client.orders || [])
                    .filter((o: any) => o.status === 'Entregue')
                    .reduce((acc: number, o: any) => acc + Number(o.value), 0),
                orderCount: (client.orders || []).length,
                createdAt: client.created_at
            }));
            setClients(mappedClients);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchClients();
    }, []);

    return { clients, loading, refresh: fetchClients };
}

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchOrders() {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, clients(name, email)')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else {
            const mappedOrders: Order[] = (data || []).map((o: any) => ({
                id: o.id,
                clientName: o.clients?.name || 'Cliente Removido',
                clientEmail: o.clients?.email || '',
                productName: o.product_name,
                value: Number(o.value),
                costValue: Number(o.cost_value || 0),
                status: o.status,
                createdAt: new Date(o.created_at).toLocaleDateString('pt-BR'),
                deadline: o.deadline ? new Date(o.deadline).toLocaleDateString('pt-BR') : 'Sem prazo',
                items: o.items || [],
                amountPaid: Number(o.amount_paid || 0),
                discount: Number(o.discount || 0),
                paymentMethod: o.payment_method || 'Dinheiro',
                productionStatus: o.production_status || 'Aguardando',
                eventDate: o.event_date || '',
                theme: o.theme || '',
                notes: o.notes || ''
            }));
            setOrders(mappedOrders);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    return { orders, loading, refresh: fetchOrders };
}

export function useQuotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchQuotes() {
        setLoading(true);
        const { data, error } = await supabase
            .from('quotes')
            .select('*, clients(name)')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching quotes:', error);
        else {
            const mappedQuotes: Quote[] = (data || []).map((q: any) => ({
                id: q.id,
                clientName: q.clients?.name || 'N/A',
                clientId: q.client_id,
                description: q.description,
                value: Number(q.value),
                items: q.items || [],
                status: q.status,
                validUntil: q.valid_until ? new Date(q.valid_until).toLocaleDateString() : 'N/A',
                eventDate: q.event_date ? new Date(q.event_date).toLocaleDateString() : '',
                theme: q.theme || '',
                notes: q.notes
            }));
            setQuotes(mappedQuotes);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchQuotes();
    }, []);

    return { quotes, loading, refresh: fetchQuotes };
}

export function useCompanySettings() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchSettings() {
        setLoading(true);
        const { data, error } = await supabase
            .from('company_settings')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') console.error('Error fetching settings:', error);
        else if (data) {
            setSettings({
                id: data.id,
                name: data.name,
                logoUrl: data.logo_url,
                phone: data.phone,
                email: data.email,
                address: data.address,
                pixKey: data.pix_key,
                quoteMessageTemplate: data.quote_message_template
            });
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    return { settings, loading, refresh: fetchSettings };
}

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchTransactions() {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) console.error('Error fetching transactions:', error);
        else {
            const mapped = (data || []).map((t: any) => ({
                id: t.id,
                description: t.description,
                value: Number(t.value),
                date: t.date,
                category: t.category,
                type: t.type,
                paymentMethod: t.payment_method || 'Dinheiro'
            }));
            setTransactions(mapped);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    return { transactions, loading, refresh: fetchTransactions };
}

export function useDashboardStats() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyExpenses: 0,
        ordersInProduction: 0,
        newClients: 0,
        pendingPayments: 0,
        totalProfit: 0,
        paymentBreakdown: {
            pix: 0,
            card: 0,
            cash: 0
        }
    });
    const [loading, setLoading] = useState(true);

    async function fetchStats() {
        setLoading(true);

        const { data: ords } = await supabase.from('orders').select('value, cost_value, amount_paid, status, payment_method');
        const { data: trans } = await supabase.from('transactions').select('value, type, payment_method');
        const { data: cls } = await supabase.from('clients').select('id');

        const revenue = (ords || []).reduce((acc, o) => acc + Number(o.value), 0);
        const profit = (ords || []).reduce((acc, o) => acc + (Number(o.value) - Number(o.cost_value || 0)), 0);
        const expenses = (trans || []).filter(t => t.type === 'Saída').reduce((acc, t) => acc + Number(t.value), 0);
        const inProduction = (ords || []).filter(o => o.status !== 'Entregue' && o.status !== 'Cancelado').length;
        const pending = (ords || []).filter(o => Number(o.amount_paid) < Number(o.value)).length;

        const pixTotal = (ords || []).filter(o => o.payment_method === 'Pix').reduce((acc, o) => acc + Number(o.value), 0);
        const cardTotal = (ords || []).filter(o => o.payment_method?.includes('Cartão')).reduce((acc, o) => acc + Number(o.value), 0);
        const cashTotal = (ords || []).filter(o => o.payment_method === 'Dinheiro').reduce((acc, o) => acc + Number(o.value), 0);

        setStats({
            totalRevenue: revenue,
            monthlyExpenses: expenses,
            ordersInProduction: inProduction,
            newClients: (cls || []).length,
            pendingPayments: pending,
            totalProfit: profit,
            paymentBreakdown: {
                pix: pixTotal,
                card: cardTotal,
                cash: cashTotal
            }
        });
        setLoading(false);
    }

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, refresh: fetchStats };
}
