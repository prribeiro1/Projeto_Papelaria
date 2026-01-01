import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProfile } from '../hooks/useData';

interface SubscriptionGuardProps {
    session: any;
    children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ session, children }) => {
    const { profile, loading } = useProfile(session);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Bypass for admin
    if (session?.user?.email === 'admin@admin.com') {
        return <>{children}</>;
    }

    if (profile?.subscription_status === 'active') {
        return <>{children}</>;
    }

    return <Navigate to="/assinatura" />;
};

export default SubscriptionGuard;
