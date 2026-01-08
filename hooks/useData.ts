import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Order, Transaction, Quote, CompanySettings, Product } from '../types';

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
                deadline: o.deadline ? o.deadline.split('-').reverse().join('/') : 'Sem prazo',
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
                validUntil: q.valid_until ? q.valid_until.split('-').reverse().join('/') : 'N/A',
                eventDate: q.event_date ? q.event_date.split('-').reverse().join('/') : '',
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

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (error) console.error('Error fetching products:', error);
        else {
            setProducts(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, refresh: fetchProducts };
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
                quoteMessageTemplate: data.quote_message_template,
                monthly_goal: data.monthly_goal,
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

        const validOrders = (ords || []).filter(o => o.status !== 'Cancelado');
        const revenue = validOrders.reduce((acc, o) => acc + Number(o.amount_paid || 0), 0);
        const orderCosts = validOrders.reduce((acc, o) => acc + Number(o.cost_value || 0), 0);
        const expenses = (trans || []).filter(t => t.type === 'Saída').reduce((acc, t) => acc + Number(t.value || 0), 0);

        const inProduction = validOrders.filter(o => o.status !== 'Entregue').length;
        const pending = validOrders.filter(o => Number(o.amount_paid || 0) < Number(o.value || 0)).length;

        // Profit is based on ACTUAL money received minus ALL costs
        const profit = revenue - orderCosts - expenses;

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

export function useProfile(session: any) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
        } else {
            setProfile(data);
        }
        setLoading(false);
    }, [session?.user?.id]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, refresh: fetchProfile };
}

export async function exportAllData() {
    const tables = ['clients', 'orders', 'quotes', 'products', 'transactions', 'company_settings'];
    const backup: any = {};

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(`Error exporting ${table}:`, error);
            backup[table] = [];
        } else {
            backup[table] = data;
        }
    }

    return backup;
}

export async function importAllData(data: any) {
    // This is a destructive operation or append? User said "import if necessary".
    // We will attempt to insert records. Since IDs might conflict, we'll use upsert.
    const tables = ['clients', 'products', 'company_settings', 'orders', 'quotes', 'transactions'];

    for (const table of tables) {
        if (data[table] && Array.isArray(data[table])) {
            const { error } = await supabase.from(table).upsert(data[table]);
            if (error) {
                console.error(`Error importing ${table}:`, error);
                throw error;
            }
        }
    }
}
