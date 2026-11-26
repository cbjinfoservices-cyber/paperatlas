import type { supabase } from './supabase';

export type NonNullableClient = NonNullable<typeof supabase>;
