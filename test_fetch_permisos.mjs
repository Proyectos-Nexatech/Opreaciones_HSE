import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://rfrzeahbbeovqjlyhlfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcnplYWhiYmVvdnFqbHlobGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDA2NjMsImV4cCI6MjA4NjQxNjY2M30.yyLS83pKFrU6P4x4ZkpQb4LJbKIme4ueOGxb7w0k5CM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('Testing getPermisos...');
    const { data, error } = await supabase
        .from('reporte_permisos')
        .select(`
            *,
            supervisor:supervisores_hse!supervisor_id(id, name),
            empresa:empresas_cliente!empresa_id(id, name),
            centro:centros_costo!centro_costo_id(id, name, code)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch failed:', error);
    } else {
        console.log('Fetch success, count:', data.length);
        if (data.length > 0) {
            console.log('First record personal_ids:', data[0].personal_ids);
        }
    }
}

testFetch();
