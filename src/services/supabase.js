import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Supabase Configuration Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey?.length);
console.log('Full key starts with:', supabaseAnonKey?.substring(0, 20) + '...');
console.log('Environment check - URL defined:', typeof supabaseUrl !== 'undefined');
console.log('Environment check - Key defined:', typeof supabaseAnonKey !== 'undefined');
console.log('====================================');

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = `❌ CRITICAL: Supabase environment variables are missing!\nURL: ${supabaseUrl}\nKey exists: ${!!supabaseAnonKey}`;
    console.error(errorMsg);
    console.error('VITE_SUPABASE_URL:', supabaseUrl);
    console.error('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
    throw new Error('Missing Supabase configuration. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
}

console.log('✅ Supabase environment variables loaded successfully');

// Create client with error handling
let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created successfully');
} catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw error;
}

export { supabase };
export default supabase;
