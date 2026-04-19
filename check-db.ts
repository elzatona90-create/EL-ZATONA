
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: section } = await supabase.from('sections').select('id').eq('slug', 'diagnoses').single();
  if (section) {
    const { count } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('section_id', section.id);
    console.log('Total items in Diagnoses:', count);
    
    const { data: items } = await supabase.from('items').select('title, description').eq('section_id', section.id).limit(5);
    console.log('First 5 items:', JSON.stringify(items, null, 2));
  }
}

check();
