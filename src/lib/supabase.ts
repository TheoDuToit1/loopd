import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const instance = getSupabase();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});
