import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';

// Replace these with your actual Supabase URL and Anon Key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const isWeb = typeof window !== 'undefined';

export const supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
  auth: {
    storage: isWeb ? AsyncStorage : {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

if (isWeb && typeof window !== 'undefined') {
  AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
