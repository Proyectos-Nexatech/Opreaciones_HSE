
import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
    const { profile } = useAuth();

    const hasPermission = (permission: string) => {
        if (!profile || !profile.role) return false;

        // Admin always has full access
        if (profile.role_name === 'Administrador' || profile.role.name === 'Administrador') {
            return true;
        }

        // Check permissions array logic
        // The role object comes joined as 'role' from the query
        const userPermissions = profile.role.permissions || [];

        if (Array.isArray(userPermissions)) {
            return userPermissions.includes(permission);
        }

        return false;
    };

    const hasAnyPermission = (permissions: string[]) => {
        return permissions.some(p => hasPermission(p));
    };

    const canView = (section: string) => hasPermission(`${section}:ver`);
    const canCreate = (section: string) => hasPermission(`${section}:crear`);
    const canEdit = (section: string) => hasPermission(`${section}:editar`);
    const canDelete = (section: string) => hasPermission(`${section}:eliminar`);

    return {
        hasPermission,
        hasAnyPermission,
        canView,
        canCreate,
        canEdit,
        canDelete,
        role: profile?.role_name
    };
};
