import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';

<<<<<<< HEAD
// Load environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Fail-safe check for build time
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Building with placeholders.');
}

const isWeb = typeof window !== 'undefined';

export const supabase = createClient(
  (supabaseUrl || 'https://placeholder.supabase.co').trim(),
  (supabaseAnonKey || 'placeholder-key').trim(),
  {
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
  }
);

=======
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

>>>>>>> 716e38dcbf208e169647f46123208419d2f28a62
if (isWeb && typeof window !== 'undefined') {
  AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
<<<<<<< HEAD

export default supabase;
=======
>>>>>>> 716e38dcbf208e169647f46123208419d2f28a62
