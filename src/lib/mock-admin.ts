/**
 * MOCK ADMIN AUTH — works without Supabase connection.
 * These credentials are DEMO ONLY. Delete this file and
 * remove MOCK_ADMIN_EMAIL/PASSWORD from your env before
 * going live in production.
 *
 * To disable: set VITE_MOCK_ADMIN_ENABLED=false in .env
 * To change credentials: update VITE_MOCK_ADMIN_EMAIL and
 *   VITE_MOCK_ADMIN_PASSWORD in your .env or Cloudflare Secrets.
 *
 * Default test credentials (change these!):
 *   Email:    admin@drkavyas.in
 *   Password: DrKavya@Admin2024
 */

const MOCK_ENABLED =
  import.meta.env.VITE_MOCK_ADMIN_ENABLED !== "false";

const MOCK_EMAIL =
  import.meta.env.VITE_MOCK_ADMIN_EMAIL ?? "admin@drkavyas.in";

const MOCK_PASSWORD =
  import.meta.env.VITE_MOCK_ADMIN_PASSWORD ?? "DrKavya@Admin2024";

const MOCK_SESSION_KEY = "dk_mock_admin_session";

export type MockAdminSession = {
  email: string;
  role: "admin";
  name: string;
  loggedInAt: number;
};

/** Check if mock admin is logged in (localStorage) */
export function getMockAdminSession(): MockAdminSession | null {
  if (!MOCK_ENABLED) return null;
  try {
    const raw = typeof window !== "undefined"
      ? localStorage.getItem(MOCK_SESSION_KEY)
      : null;
    if (!raw) return null;
    const session = JSON.parse(raw) as MockAdminSession;
    // Expire after 8 hours
    if (Date.now() - session.loggedInAt > 8 * 60 * 60 * 1000) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Attempt mock admin login — returns true on success */
export function mockAdminLogin(email: string, password: string): boolean {
  if (!MOCK_ENABLED) return false;
  if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
    const session: MockAdminSession = {
      email,
      role: "admin",
      name: "Dr. Kavya (Demo Admin)",
      loggedInAt: Date.now(),
    };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    return true;
  }
  return false;
}

/** Log out mock admin session */
export function mockAdminLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(MOCK_SESSION_KEY);
  }
}

/** Returns true if currently logged in as mock admin */
export function isMockAdmin(): boolean {
  return getMockAdminSession() !== null;
}
