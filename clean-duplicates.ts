
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  const { data: section } = await supabase.from('sections').select('id').eq('slug', 'diagnoses').single();
  if (!section) return;

  const { data: items } = await supabase.from('items').select('id, title').eq('section_id', section.id);
  if (!items) return;

  const titles = new Set();
  const toDelete = [];

  for (const item of items) {
    if (titles.has(item.title)) {
      toDelete.push(item.id);
    } else {
      titles.add(item.title);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicates...`);
    const { error } = await supabase.from('items').delete().in('id', toDelete);
    if (error) console.error(error);
    else console.log('Duplicates removed.');
  } else {
    console.log('No duplicates found.');
  }

  const { count } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('section_id', section.id);
  console.log('Total unique items in Diagnoses:', count);
}

clean();
