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
        console.log('Solicitando envio de notificação (V4):', title);

        if (Notification.permission === 'granted') {
            // Tentativa 1: Window Notification (Mais simples e direta)
            try {
                console.log('Tentativa 1: Usando construtor Notification padrão');
                const n = new Notification(title, {
                    icon: '/logo.png',
                    ...options
                });
                n.onclick = () => {
                    window.focus();
                    n.close();
                };
            } catch (err) {
                console.warn('Falha no construtor Notification, tentando Service Worker:', err);
                // Tentativa 2: Service Worker (Obrigatório em alguns casos mobile/PWA)
                const registration = await navigator.serviceWorker.ready;
                if (registration && registration.showNotification) {
                    await (registration as any).showNotification(title, {
                        icon: '/logo.png',
                        badge: '/logo.png',
                        ...options
                    });
                }
            }
        } else {
            console.error('Permissão de notificações não está ativa ou foi revogada.');
        }
    }, []);

    const checkDeadlines = useCallback((orders: Order[]) => {
        if (Notification.permission !== 'granted') return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log('Checando prazos para:', orders.length, 'pedidos');

        orders.forEach(order => {
            if (order.status === OrderStatus.DELIVERED) return;
            if (!order.deadline || order.deadline === 'Sem prazo') return;

            const parts = order.deadline.split('/');
            if (parts.length !== 3) return;

            const [day, month, year] = parts.map(Number);
            const deadlineDate = new Date(year, month - 1, day);
            deadlineDate.setHours(0, 0, 0, 0);

            // LOG PARA DEBUG NO CLIENTE
            console.log(`Pedido: ${order.clientName} | Prazo: ${order.deadline} | Comparando com Hoje: ${today.toLocaleDateString()}`);

            const storageKey = `notified-v4-${order.id}-${deadlineDate.getTime()}`;
            const alreadyNotified = sessionStorage.getItem(storageKey);

            if (deadlineDate.getTime() === today.getTime() && !alreadyNotified) {
                sendNotification(`🚨 PROATIVX: Urgente`, {
                    body: `Pedido de ${order.clientName} vence HOJE!`,
                    tag: `deadline-${order.id}`,
                    requireInteraction: true
                });
                sessionStorage.setItem(storageKey, 'true');
            } else if (deadlineDate.getTime() === tomorrow.getTime() && !alreadyNotified) {
                sendNotification(`⏳ PROATIVX: Amanhã`, {
                    body: `Pedido de ${order.clientName} vence amanhã.`,
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
