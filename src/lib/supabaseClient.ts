
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sttdjpyywmlhrwfrhqjm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dGRqcHl5d21saHJ3ZnJocWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzQwOTAsImV4cCI6MjA2OTk1MDA5MH0.vKlMViuht6V-2QJsgBZGBlrmovBenhexRzjdNs6D6ss";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
