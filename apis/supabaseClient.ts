import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { USE_MOCK_DATA } from './config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client.
 *
 * Constructed lazily so the app still boots in mock mode without credentials —
 * the previous version threw at import time, which took the whole bundle down
 * before a single screen rendered.
 */
let client: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY in .env, or leave ' +
        'EXPO_PUBLIC_USE_MOCK_DATA unset to keep using mock data.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/** True when credentials are present and mock mode is off. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey) && !USE_MOCK_DATA;

/**
 * Proxy that defers client construction until a property is actually read, so
 * `import { supabase }` is free in mock mode.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    if (!client) client = createSupabaseClient();
    return Reflect.get(client, property);
  },
});
