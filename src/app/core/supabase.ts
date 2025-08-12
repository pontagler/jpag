import { createClient } from '@supabase/supabase-js'
import { environment } from '../../environment/environment'


// Replace with your Supabase project credentials
const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBla2FleGZybmh5c2RudGJ5cWJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM4NjE2MywiZXhwIjoyMDY5OTYyMTYzfQ.k7LW53AYljpKwTPbQqEHS1SAD9MoE19DvNjYM22kOKA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


export const supabase1 = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)


