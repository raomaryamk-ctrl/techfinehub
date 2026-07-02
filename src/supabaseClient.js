import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://vehcghrqfpksmrffbuks.supabase.co'
const supabaseAnonKey = 'sb_publishable_T_NO9l8iTSAMVvj4WoQqkA_PU68o3gA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)