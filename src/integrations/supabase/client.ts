
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qpveeqvzvukolfagasne.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdmVlcXZ6dnVrb2xmYWdhc25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjEzOTcsImV4cCI6MjA2NDY5NzM5N30.rnEQz2aeCFoEPtBGXj6ydg4oKTY8ftX7d4TjrJXMUC4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
