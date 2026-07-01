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
// The Supabase query builder uses a fluent/builder pattern:
//   supabase.from('t').select('*').eq('id', x).maybeSingle()
// All intermediate calls (.select, .eq, .order, .limit…) must return a
// chain-able object. The final await/.then() must receive {data,error}.
//
// Solution: make noopQB an object with explicit no-op methods for every
// builder method Supabase uses, all returning `noopQB` itself (synchronous
// chaining). Add a custom `then` so `await noopQB` resolves to {data:null}.
function createNoOpClient() {
  const noop = async () => ({ data: null, error: null, count: null });
  const noopResult = { data: null, error: null, count: null, status: 200, statusText: 'OK' };

  // Builder object — all query builder methods return itself for chaining.
  // `then` makes it a thenable so `await noopQB` resolves to noopResult.
  const noopQB: any = {
    // Builder methods (synchronous, return this for chaining)
    select: () => noopQB,
    insert: () => noopQB,
    update: () => noopQB,
    upsert: () => noopQB,
    delete: () => noopQB,
    eq: () => noopQB,
    neq: () => noopQB,
    gt: () => noopQB,
    gte: () => noopQB,
    lt: () => noopQB,
    lte: () => noopQB,
    like: () => noopQB,
    ilike: () => noopQB,
    is: () => noopQB,
    in: () => noopQB,
    contains: () => noopQB,
    containedBy: () => noopQB,
    range: () => noopQB,
    order: () => noopQB,
    limit: () => noopQB,
    offset: () => noopQB,
    single: () => noopQB,
    maybeSingle: () => noopQB,
    returns: () => noopQB,
    count: () => noopQB,
    head: () => noopQB,
    explain: () => noopQB,
    filter: () => noopQB,
    match: () => noopQB,
    or: () => noopQB,
    not: () => noopQB,
    textSearch: () => noopQB,
    overlaps: () => noopQB,
    throwOnError: () => noopQB,
    // Terminal: makes `await noopQB` work without Promises from builder methods
    then: (resolve: (v: any) => any) => Promise.resolve(noopResult).then(resolve),
    catch: (reject: (e: any) => any) => Promise.resolve(noopResult).catch(reject),
    finally: (cb: () => void) => Promise.resolve(noopResult).finally(cb),
  };

  return {
    from: () => noopQB,
    rpc: noop,
    storage: { from: () => ({ upload: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {},
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getClaims: async () => ({ data: null, error: { message: 'Not configured' } }),
      onAuthStateChange: (_: any, cb: any) => {
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
