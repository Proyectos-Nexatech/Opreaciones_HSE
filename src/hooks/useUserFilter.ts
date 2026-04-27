import { useAuth } from '../context/AuthContext';

/**
 * Roles que tienen acceso total a los datos de todos los usuarios.
 * El administrador ve todo; los demás sólo ven sus propios registros.
 */
const ADMIN_ROLES = ['Administrador', 'Admin', 'admin', 'administrador', 'Super Admin'];

export function useUserFilter() {
    const { user, profile } = useAuth();

    const roleName: string = profile?.role_name || profile?.role?.name || '';
    const isAdmin = ADMIN_ROLES.some(r => roleName.toLowerCase() === r.toLowerCase())
        || profile?.email?.endsWith('@nexatech.com.co');

    return {
        /** UUID del usuario autenticado (auth.uid) */
        userId: user?.id ?? null,
        /** true si el usuario es administrador (ve todos los datos) */
        isAdmin,
        /** Si no es admin, usar este filtro en las queries; si es admin, es null */
        filterUserId: isAdmin ? null : (user?.id ?? null),
    };
}
