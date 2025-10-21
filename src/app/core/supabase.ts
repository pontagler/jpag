import { createClient } from '@supabase/supabase-js'
import { environment } from '../../environment/environment'


// Replace with your Supabase project credentials
const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY= environment.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


export const supabase1 = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)


