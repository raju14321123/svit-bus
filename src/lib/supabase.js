import { createClient } from '@supabase/supabase-js';

// These keys connect your code to your specific Supabase project
const supabaseUrl = 'https://pjbkeeumjmvnsnzbdaxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYmtlZXVtam12bnNuemJkYXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Njc0NTUsImV4cCI6MjA4MTA0MzQ1NX0.YBhb_zuuBpQep-qfVl6xhSA5apT-1mBhEuAjTl2wTxU;

export const supabase = createClient(supabaseUrl, supabaseKey);
