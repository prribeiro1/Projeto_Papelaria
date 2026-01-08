import { useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types';

export function useWebNotifications() {
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.error('Este navegador nao suporta notificacoes desktop');
            return false;
        }

        if (Notification.permission === 'granted') return true;

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }, []);

    const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
        if (Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                registration.showNotification(title, {
                    icon: '/logo.png',
                    badge: '/logo.png',
                    ...options
                });
            } else {
                new Notification(title, {
                    icon: '/logo.png',
                    ...options
                });
            }
        } else {
            console.warn('Permissao de notificacao nao concedida:', Notification.permission);
        }
    }, []);

    const checkDeadlines = useCallback((orders: Order[]) => {
        if (Notification.permission !== 'granted') return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        orders.forEach(order => {
            if (order.status === OrderStatus.DELIVERED) return;
            if (!order.deadline || order.deadline === 'Sem prazo') return;

            // Formato esperado: dd/mm/aaaa (vindo do hook useOrders reformulado)
            const parts = order.deadline.split('/');
            if (parts.length !== 3) return;

            const [day, month, year] = parts.map(Number);
            const deadlineDate = new Date(year, month - 1, day);
            deadlineDate.setHours(0, 0, 0, 0);

            // Chave para evitar duplicados na mesma sessao
            const storageKey = `notified-${order.id}-${deadlineDate.getTime()}`;
            if (sessionStorage.getItem(storageKey)) return;

            if (deadlineDate.getTime() === today.getTime()) {
                sendNotification(`🚨 Prazo Hoje: ${order.clientName}`, {
                    body: `O pedido "${order.productName}" vence hoje!`,
                    tag: `deadline-${order.id}`,
                    requireInteraction: true
                });
                sessionStorage.setItem(storageKey, 'true');
            } else if (deadlineDate.getTime() === tomorrow.getTime()) {
                sendNotification(`⏳ Prazo Amanhã: ${order.clientName}`, {
                    body: `O pedido "${order.productName}" vence amanhã.`,
                    tag: `deadline-${order.id}`
                });
                sessionStorage.setItem(storageKey, 'true');
            }
        });
    }, [sendNotification]);

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    return { requestPermission, sendNotification, checkDeadlines };
}
