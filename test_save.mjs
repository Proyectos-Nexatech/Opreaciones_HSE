import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://rfrzeahbbeovqjlyhlfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcnplYWhiYmVvdnFqbHlobGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDA2NjMsImV4cCI6MjA4NjQxNjY2M30.yyLS83pKFrU6P4x4ZkpQb4LJbKIme4ueOGxb7w0k5CM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSave() {
    const payload = {
        jornada: 'Dia',
        supervisor_id: '1',
        empresa_id: 'E-001',
        centro_costo_id: 'CC-001',
        tipo: 'Permisos Generales',
        fecha: '2026-02-12',
        personal_ids: ['3'],
        personal_involucrado: 'Carlos Mario Ruiz'
    };

    console.log('Testing save with payload:', JSON.stringify(payload, null, 2));
    const { data, error } = await supabase
        .from('reporte_permisos')
        .insert(payload)
        .select();

    if (error) {
        console.error('Save failed:', error);
    } else {
        console.log('Save success:', data);
    }
}

testSave();
