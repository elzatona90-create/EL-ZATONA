
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function reformat() {
  console.log('Starting reformatting for DIAGNOSES...');

  const { data: section } = await supabase.from('sections').select('id').eq('slug', 'diagnoses').single();
  if (!section) {
    console.error('Section not found');
    return;
  }

  const { data: items, error } = await supabase
    .from('items')
    .select('id, description')
    .eq('section_id', section.id);

  if (error || !items) {
    console.error('Error fetching items:', error);
    return;
  }

  console.log(`Processing ${items.length} items...`);

  const updates = items.map(item => {
    let desc = item.description || '';
    
    // Check if it's already reformatted or has the pattern
    if (desc.includes('icd code :') && !desc.includes('\nicd code :')) {
        // Simple replace to add newline before 'icd code'
        desc = desc.replace('icd code :', '\nicd code :');
        return { id: item.id, description: desc };
    }
    
    // Handle cases where it might be formatted differently but has "ICD CODE"
    if (desc.includes('ICD CODE') && !desc.includes('\nICD CODE')) {
        desc = desc.replace('ICD CODE', '\nICD CODE');
        return { id: item.id, description: desc };
    }

    return null;
  }).filter(Boolean);

  if (updates.length > 0) {
    console.log(`Updating ${updates.length} items...`);
    // Batch updates manually or use a loop (Supabase doesn't support bulk update with different values easily in a single call without RPC)
    // For 500 items, a loop with small batches or individual calls is fine in this env.
    for (const update of updates) {
       await supabase.from('items').update({ description: update.description }).eq('id', update.id);
    }
    console.log('Update complete.');
  } else {
    console.log('No items needed reformatting.');
  }
}

reformat();
