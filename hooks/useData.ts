import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Order, Transaction, Product } from '../types';

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchClients() {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('name', { ascending: true });

        if (error) console.error('Error fetching clients:', error);
        else setClients(data || []);
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
            // Map Supabase data to our Order type
            const mappedOrders: Order[] = (data || []).map((o: any) => ({
                id: o.id,
                clientName: o.clients?.name || 'Cliente Removido',
                clientEmail: o.clients?.email || '',
                productName: o.product_name,
                value: Number(o.value),
                status: o.status,
                createdAt: new Date(o.created_at).toLocaleDateString(),
                deadline: o.deadline ? new Date(o.deadline).toLocaleDateString() : 'Sem prazo'
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

export function useDashboardStats() {
    const [stats, setStats] = useState({
        faturamento: 0,
        despesas: 0,
        producao: 0,
        clientesNovos: 0
    });
    const [loading, setLoading] = useState(true);

    async function fetchStats() {
        setLoading(true);

        // This is a simplified version. In a real app, we'd do more complex aggregations.
        const { data: transactions } = await supabase.from('transactions').select('value, type');
        const { data: orders } = await supabase.from('orders').select('id').eq('status', 'Em Produção');
        const { data: clients } = await supabase.from('clients').select('id');

        let faturamento = 0;
        let despesas = 0;

        transactions?.forEach(t => {
            if (t.type === 'Entrada') faturamento += Number(t.value);
            else despesas += Number(t.value);
        });

        setStats({
            faturamento,
            despesas,
            producao: orders?.length || 0,
            clientesNovos: clients?.length || 0
        });
        setLoading(false);
    }

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, refresh: fetchStats };
}
