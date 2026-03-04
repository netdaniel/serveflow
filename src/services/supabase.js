import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Supabase Configuration Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey?.length);
console.log('Full key starts with:', supabaseAnonKey?.substring(0, 20) + '...');
console.log('====================================');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables are not set. The app will run in demo mode.');
    console.warn('VITE_SUPABASE_URL:', supabaseUrl);
    console.warn('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
} else {
    console.log('✅ Supabase environment variables loaded successfully');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
