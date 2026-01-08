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
        console.log('Solicitando envio de notificação:', title);

        if (Notification.permission === 'granted') {
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration && registration.showNotification) {
                    console.log('Enviando via Service Worker (Método Robusto)');
                    await (registration as any).showNotification(title, {
                        icon: '/logo.png',
                        badge: '/logo.png',
                        ...options
                    });
                } else {
                    console.log('Enviando via Window Notification (Fallback)');
                    new Notification(title, {
                        icon: '/logo.png',
                        ...options
                    });
                }
            } catch (err) {
                console.error('Erro ao enviar notificação via SW, tentando Window:', err);
                new Notification(title, {
                    icon: '/logo.png',
                    ...options
                });
            }
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

            const parts = order.deadline.split('/');
            if (parts.length !== 3) return;

            const [day, month, year] = parts.map(Number);
            const deadlineDate = new Date(year, month - 1, day);
            deadlineDate.setHours(0, 0, 0, 0);

            const storageKey = `notified-${order.id}-${deadlineDate.getTime()}`;
            const alreadyNotified = sessionStorage.getItem(storageKey);

            if (deadlineDate.getTime() === today.getTime() && !alreadyNotified) {
                sendNotification(`PROATIVX: Prazo Hoje!`, {
                    body: `${order.clientName} - ${order.productName}`,
                    tag: `deadline-${order.id}`,
                    requireInteraction: true
                });
                sessionStorage.setItem(storageKey, 'true');
            } else if (deadlineDate.getTime() === tomorrow.getTime() && !alreadyNotified) {
                sendNotification(`PROATIVX: Prazo Amanhã`, {
                    body: `${order.clientName} - ${order.productName}`,
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
