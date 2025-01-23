import { createClient } from '@supabase/supabase-js';

// Remplace par tes propres informations Supabase
const supabaseUrl = 'https://pxixsulxhqvddqxkslts.supabase.co'; // URL de ton projet Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4aXhzdWx4aHF2ZGRxeGtzbHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MjM4MjUsImV4cCI6MjA1MzE5OTgyNX0.Ven95Zi9pv13OOjUC53-yBA4IIUBX3ffPVTp_G_7kJo'; // Utilise la clé publique
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
