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

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/logo.png',
                ...options
            });
        }
    }, []);

    const checkDeadlines = useCallback((orders: Order[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        orders.forEach(order => {
            if (order.status === OrderStatus.DELIVERED) return;
            if (order.deadline === 'Sem prazo') return;

            // Converta a string 'dd/mm/aaaa' para objeto Date para comparacao precisa
            const [day, month, year] = order.deadline.split('/').map(Number);
            const deadlineDate = new Date(year, month - 1, day);
            deadlineDate.setHours(0, 0, 0, 0);

            if (deadlineDate.getTime() === today.getTime()) {
                sendNotification(`🚨 Prazo Hoje: ${order.clientName}`, {
                    body: `O pedido "${order.productName}" vence hoje!`,
                    tag: `deadline-${order.id}`
                });
            } else if (deadlineDate.getTime() === tomorrow.getTime()) {
                sendNotification(`⏳ Prazo Amanhã: ${order.clientName}`, {
                    body: `O pedido "${order.productName}" vence amanhã.`,
                    tag: `deadline-${order.id}`
                });
            }
        });
    }, [sendNotification]);

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    return { requestPermission, sendNotification, checkDeadlines };
}
