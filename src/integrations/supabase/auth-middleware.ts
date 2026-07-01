// Auth middleware for TanStack Start server functions.
// When Supabase env vars are missing, throws a clear "not configured" error
// (admin server functions become unavailable but the site keeps rendering).
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewKey(k: string) { return k.startsWith('sb_publishable_') || k.startsWith('sb_secret_'); }

function makeAdminFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (isNewKey(key) && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const URL  = process.env.SUPABASE_URL;
    const KEY  = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!URL || !KEY) {
      // Return a graceful "not configured" response so server functions don't
      // crash the edge worker — callers see empty data or a soft error message.
      throw new Error('Supabase is not configured on this deployment. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Cloudflare Pages environment variables.');
    }

    const request = getRequest();
    const authHeader = request?.headers?.get('authorization') ?? '';

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized');
    }

    const token = authHeader.slice(7);
    if (!token || token.split('.').length !== 3) {
      throw new Error('Unauthorized: invalid token');
    }

    const supabase = createClient<Database>(URL, KEY, {
      global: {
        fetch: makeAdminFetch(KEY),
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) throw new Error('Unauthorized: invalid session');

    return next({
      context: { supabase, userId: data.claims.sub, claims: data.claims },
    });
  },
);
