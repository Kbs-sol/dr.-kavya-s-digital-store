// Server-side Supabase client with service role key — bypasses RLS.
// Use ONLY inside createServerFn() handlers, never in route/client code.
// Gracefully returns a no-op client when env vars are missing so SSR
// doesn't crash during Cloudflare Pages cold starts without secrets set.
//
// Load as a dynamic import inside server handlers:
//   const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewKey(key: string) {
  return key.startsWith('sb_publishable_') || key.startsWith('sb_secret_');
}

function createAdminFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (isNewKey(key) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

// ─── No-op admin stub ────────────────────────────────────────────────────
function createNoOpAdmin() {
  const noop = async () => ({ data: null, error: null, count: null });
  const noopQB: any = new Proxy({}, { get: () => noopQB, apply: () => noop() });
  return {
    from: () => noopQB,
    rpc: noop,
    auth: { admin: { createUser: noop, deleteUser: noop, listUsers: noop } },
    storage: { from: () => ({ upload: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  } as unknown as SupabaseClient<Database>;
}

function createSupabaseAdminClient(): SupabaseClient<Database> {
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!URL || !KEY) {
    console.warn('[Dr. Kavya\'s] SUPABASE_SERVICE_ROLE_KEY not set — admin operations disabled.');
    return createNoOpAdmin();
  }

  return createClient<Database>(URL, KEY, {
    global: { fetch: createAdminFetch(KEY) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

let _admin: SupabaseClient<Database> | undefined;

export const supabaseAdmin: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_, prop, receiver) {
      if (!_admin) _admin = createSupabaseAdminClient();
      return Reflect.get(_admin, prop, receiver);
    },
  },
);
