import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://mduhxoytsqwptyjcquff.supabase.co';
const supabaseAnonKey = 'sb_publishable_phwYK_PWNWSqrIgiUg5B3g_jr5PxZT3';

export const supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
