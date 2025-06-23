import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ltlctdgakuapqznobfyt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGN0ZGdha3VhcHF6bm9iZnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjExNjksImV4cCI6MjA2NTEzNzE2OX0.IjSa18pzj9m6LXhtXZrsMgHXRim5P3WF3Uk_QHUdCcc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
