import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfrzeahbbeovqjlyhlfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcnplYWhiYmVvdnFqbHlobGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDA2NjMsImV4cCI6MjA4NjQxNjY2M30.yyLS83pKFrU6P4x4ZkpQb4LJbKIme4ueOGxb7w0k5CM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('Fetching supervisores...');
    const { data: sups, error: errSup } = await supabase.from('supervisores_hse').select('*');
    if (errSup) console.error('Error sups:', errSup);
    else console.log('Sups count:', sups.length);

    console.log('Fetching empresas...');
    const { data: emp, error: errEmp } = await supabase.from('empresas_cliente').select('*');
    if (errEmp) console.error('Error emp:', errEmp);
    else console.log('Emp count:', emp.length);

    console.log('Fetching centros...');
    const { data: cc, error: errCC } = await supabase.from('centros_costo').select('*');
    if (errCC) console.error('Error cc:', errCC);
    else console.log('CC count:', cc.length);

    console.log('Fetching personal...');
    const { data: p, error: errP } = await supabase.from('personal_hse').select('*');
    if (errP) console.error('Error p:', errP);
    else console.log('P count:', p.length);
}

testFetch();
