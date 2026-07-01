// Supabase client — gracefully handles missing environment variables.
// When SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are absent the client is a
// safe no-op: every call returns { data: null, error: null } so the UI
// renders correctly and shows empty states rather than crashing.
//
// To connect Supabase:
//   1. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
//   2. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY as Cloudflare Pages
//      environment variables (Settings → Environment variables).

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ─── Helper: new-style publishable key needs apikey header, not Bearer ─────
function createSupabaseFetch(key: string): typeof fetch {
  const isNewKey = key.startsWith('sb_publishable_') || key.startsWith('sb_secret_');
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request
        ? input.headers
        : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }
    if (isNewKey && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

// ─── No-op stub (returned when env vars are absent) ───────────────────────
function createNoOpClient() {
  const noop = async () => ({ data: null, error: null, count: null });
  const noopQB: any = new Proxy({}, {
    get: () => noopQB,
    apply: () => noop(),
  });

  return {
    from: () => noopQB,
    rpc: noop,
    storage: { from: () => ({ upload: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (_: any, cb: any) => {
        // immediately call with null session so UI shows signed-out state
        setTimeout(() => cb('SIGNED_OUT', null), 0);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithOtp: noop,
      signInWithOAuth: noop,
      signInWithPassword: noop,
      signUp: noop,
      signOut: noop,
      setSession: noop,
    },
  } as unknown as SupabaseClient<Database>;
}

// ─── Real client factory ───────────────────────────────────────────────────
function createSupabaseClient(): SupabaseClient<Database> {
  const SUPABASE_URL =
    (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined) ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined);

  const SUPABASE_KEY =
    (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY : undefined) ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_PUBLISHABLE_KEY : undefined);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    if (typeof window !== 'undefined') {
      // Only log in browser, not during SSR (would spam server logs)
      console.warn('[Dr. Kavya\'s] Supabase env vars not set — running in offline mode. Products/auth features disabled.');
    }
    return createNoOpClient();
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    global: { fetch: createSupabaseFetch(SUPABASE_KEY) },
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Lazy singleton — created once on first access
let _client: SupabaseClient<Database> | undefined;

// Import like: import { supabase } from "@/integrations/supabase/client";
export const supabase: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_, prop, receiver) {
      if (!_client) _client = createSupabaseClient();
      return Reflect.get(_client, prop, receiver);
    },
  },
);

// Re-export for convenience
export type { Database };
