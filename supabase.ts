import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmddumljaqqeykgxepvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZGR1bWxqYXFxZXlrZ3hlcHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzg2NjYsImV4cCI6MjA4NDE1NDY2Nn0.HWPMphCyJqnPMcutfc4wnu-9dpa7diM0WMuBfPXlbLg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
