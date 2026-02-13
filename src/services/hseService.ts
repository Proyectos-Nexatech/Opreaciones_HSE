import { supabase } from '../lib/supabaseClient';

// ============================================================
// CATÁLOGOS
// ============================================================

export async function getSupervisores() {
    const { data, error } = await supabase
        .from('supervisores_hse')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
}

export async function createSupervisorHSE(supervisor: any) {
    const { data, error } = await supabase
        .from('supervisores_hse')
        .insert(supervisor)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateSupervisorHSE(id: string, updates: any) {
    const { data, error } = await supabase
        .from('supervisores_hse')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteSupervisorHSE(id: string) {
    const { error } = await supabase
        .from('supervisores_hse')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

export async function getPersonal() {
    const { data, error } = await supabase
        .from('personal_hse')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
}

export async function createPersonal(person: any) {
    const { data, error } = await supabase
        .from('personal_hse')
        .insert(person)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updatePersonal(id: string, updates: any) {
    const { data, error } = await supabase
        .from('personal_hse')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deletePersonal(id: string) {
    const { error } = await supabase
        .from('personal_hse')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

export async function getEmpresas() {
    const { data, error } = await supabase
        .from('empresas_cliente')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
}

export async function createEmpresa(empresa: any) {
    const { data, error } = await supabase
        .from('empresas_cliente')
        .insert(empresa)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateEmpresa(id: string, updates: any) {
    const { data, error } = await supabase
        .from('empresas_cliente')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteEmpresa(id: string) {
    const { error } = await supabase
        .from('empresas_cliente')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

export async function getCentrosCosto() {
    const { data, error } = await supabase
        .from('centros_costo')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
}

export async function createCentroCosto(centro: any) {
    const { data, error } = await supabase
        .from('centros_costo')
        .insert(centro)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateCentroCosto(id: string, updates: any) {
    const { data, error } = await supabase
        .from('centros_costo')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteCentroCosto(id: string) {
    const { error } = await supabase
        .from('centros_costo')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ============================================================
// REPORTE DE PERMISOS
// ============================================================

export async function getPermisos() {
    const { data, error } = await supabase
        .from('reporte_permisos')
        .select(`
            *,
            supervisor:supervisor_id(id, name),
            empresa:empresa_id(id, name),
            centro:centro_costo_id(id, name, code)
        `)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createPermiso(permiso: any) {
    const { data, error } = await supabase
        .from('reporte_permisos')
        .insert(permiso)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updatePermiso(id: string, updates: any) {
    const { data, error } = await supabase
        .from('reporte_permisos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deletePermiso(id: string) {
    const { error } = await supabase
        .from('reporte_permisos')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ============================================================
// REPORTE DE ASISTENCIA
// ============================================================

export async function getAsistencia(fecha?: string) {
    let query = supabase
        .from('reporte_asistencia')
        .select('*')
        .order('created_at', { ascending: false });

    if (fecha) {
        query = query.eq('fecha', fecha);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function createAsistencia(record: any) {
    const { data, error } = await supabase
        .from('reporte_asistencia')
        .insert(record)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateAsistencia(id: string, updates: any) {
    const { data, error } = await supabase
        .from('reporte_asistencia')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteAsistencia(id: string) {
    const { error } = await supabase
        .from('reporte_asistencia')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ============================================================
// REPORTE DE EVENTOS
// ============================================================

export async function getEventos() {
    const { data, error } = await supabase
        .from('reporte_eventos')
        .select(`
            *,
            supervisor:supervisores_hse(id, name),
            empresa:empresas_cliente(id, name),
            centro:centros_costo(id, name, code)
        `)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createEvento(evento: any) {
    const { data, error } = await supabase
        .from('reporte_eventos')
        .insert(evento)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateEvento(id: string, updates: any) {
    const { data, error } = await supabase
        .from('reporte_eventos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteEvento(id: string) {
    const { error } = await supabase
        .from('reporte_eventos')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ============================================================
// REPORTE DE NOVEDADES
// ============================================================

export async function getNovedades() {
    const { data, error } = await supabase
        .from('reporte_novedades')
        .select(`
            *,
            empresa:empresas_cliente(id, name),
            centro:centros_costo(id, name, code)
        `)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createNovedad(novedad: any) {
    const { data, error } = await supabase
        .from('reporte_novedades')
        .insert(novedad)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateNovedad(id: string, updates: any) {
    const { data, error } = await supabase
        .from('reporte_novedades')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteNovedad(id: string) {
    const { error } = await supabase
        .from('reporte_novedades')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ============================================================
// REPORTE DE AUSENTISMO
// ============================================================

export async function getAusentismo() {
    const { data, error } = await supabase
        .from('reporte_ausentismo')
        .select(`
            *,
            empresa:empresas_cliente(id, name),
            centro:centros_costo(id, name, code)
        `)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createAusentismo(record: any) {
    const { data, error } = await supabase
        .from('reporte_ausentismo')
        .insert(record)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateAusentismo(id: string, updates: any) {
    const { data, error } = await supabase
        .from('reporte_ausentismo')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteAusentismo(id: string) {
    const { error } = await supabase
        .from('reporte_ausentismo')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ============================================================
// OCURRIÓ ASÍ
// ============================================================

export async function getOcurrioAsi() {
    const { data, error } = await supabase
        .from('ocurrio_asi')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createOcurrioAsi(record: any) {
    const { data, error } = await supabase
        .from('ocurrio_asi')
        .insert(record)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateOcurrioAsi(id: string, updates: any) {
    const { data, error } = await supabase
        .from('ocurrio_asi')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteOcurrioAsi(id: string) {
    const { error } = await supabase
        .from('ocurrio_asi')
        .delete()
        .eq('id', id);
    if (error) throw error;
}
// ============================================================
// GESTIÓN DE USUARIOS Y ROLES
// ============================================================

export async function getProfiles() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select(`
            *,
            role:role_name(*)
        `)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getRoles() {
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
}

export async function updateProfile(id: string, updates: any) {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteProfile(id: string) {
    const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

export async function createUser(email: string, fullName: string, roleName: string) {
    // Note: This uses standard signUp. In a real admin scenario, you'd use admin.createUser
    // with a service role key on the server/edge function.
    // For this client-side implementation, we rely on the user having a temporary password
    // or the admin can trigger a password reset later.
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
            data: {
                full_name: fullName,
            }
        }
    });

    if (authError) throw authError;

    // After signUp, the trigger 'handle_new_user' should create the profile.
    // However, we want to ensure the role is set correctly (the trigger defaults to 'Visualizador').
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
                role_name: roleName,
                full_name: fullName
            })
            .eq('id', authData.user.id);

        if (profileError) {
            console.error('Error updating profile role:', profileError);
        }
    }

    return authData;
}

export async function createRole(role: any) {
    const { id, ...roleData } = role; // Remove any temporary ID
    const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateRole(id: string, updates: any) {
    const { id: _, ...updateData } = updates; // Ensure ID is not in the update payload
    const { data, error } = await supabase
        .from('roles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteRole(id: string) {
    const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

export async function resetUserPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
}
