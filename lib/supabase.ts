// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from '@/lib/env';

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const BUCKET_NAME = 'business-logos';