import { createClient } from '@supabase/supabase-js';
import { passwordLinkTarget } from '@/auth/passwordLink';

const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

const passwordTarget = passwordLinkTarget(window.location, __BASE_PATH__);
if (passwordTarget) window.history.replaceState(window.history.state, '', passwordTarget);

/** One single client for the whole app — never create a second instance. */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});