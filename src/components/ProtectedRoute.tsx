import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const { isCliente } = usePermissions();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// Componente separado para proteger las rutas del layout principal (requiere que NO sea Cliente)
export const AdminRoute = () => {
    const { user, loading, profile } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si es usuario Cliente, redirigir a su dashboard propio
    const roleName = profile?.role_name || profile?.role?.name;
    if (roleName === 'Cliente') {
        return <Navigate to="/dashboard-cliente" replace />;
    }

    return <Outlet />;
};
