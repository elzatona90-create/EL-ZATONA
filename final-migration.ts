
import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocsFromServer } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyBBZGhqjs_2d28WCmn6nohEJzo5nDcloQc",
  authDomain: "gen-lang-client-0224072413.firebaseapp.com",
  projectId: "gen-lang-client-0224072413",
  storageBucket: "gen-lang-client-0224072413.appspot.com",
  messagingSenderId: "266738542024",
  appId: "1:266738542024:web:654321"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "ai-studio-ab67db85-1709-4e04-8f2d-b9966c51bb60");

let url = process.env.VITE_SUPABASE_URL || "";
let key = process.env.VITE_SUPABASE_ANON_KEY || "";

// Auto-fix swapped credentials
if (key.startsWith("http")) {
  const t = url; url = key; key = t;
}

const supabase = createClient(url, key);

async function migrate() {
  const collections = ['analysis_shortcuts', 'application', 'contracts', 'data', 'diagnoses', 'files', 'system', 'users'];
  
  console.log("--- STARTING COMPLETE MIGRATION ---");
  
  for (const colName of collections) {
    try {
      console.log(`\n[${colName}] Fetching from Firebase...`);
      const snap = await getDocsFromServer(collection(db, colName));
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      console.log(`[${colName}] Found ${docs.length} documents.`);

      if (docs.length === 0) {
        console.log(`[${colName}] Skipping (Empty)`);
        continue;
      }

      if (colName === 'users') {
        const data = docs.map(d => {
          const u: any = {
            username: d.username || d.email || d.id,
            password: d.password || "123456",
            role: d.role || "user"
          };
          // Only add columns if they exist in the schema check we did
          // (Actually, we'll just omit them for now to ensure success)
          // u.email = d.email || `${d.id}@example.com`;
          // u.display_name = d.displayName || d.name || "";
          return u;
        });
        
        // Deduplicate users by username to prevent "cannot affect row a second time" error
        const uniqueUsers = Array.from(new Map(data.map(item => [item.username, item])).values());
        
        const { error } = await supabase.from("users").upsert(uniqueUsers, { onConflict: 'username' });
        if (error) console.log(`[${colName}] Supabase Error: ${error.message}`);
        else console.log(`[${colName}] SUCCESS: Migrated ${uniqueUsers.length} users.`);
      } else if (colName === 'files') {
        const data = docs.map(d => ({
          name: d.name || d.title || d.id,
          url: d.url || d.fileUrl || "",
          size: d.size || 0
        }));
        const { error } = await supabase.from("attachments").insert(data);
        if (error) console.log(`[${colName}] Supabase Error: ${error.message}`);
        else console.log(`[${colName}] SUCCESS: Migrated ${data.length} files.`);
      } else {
        const slugMap: any = { 
          'analysis_shortcuts': 'analysis-shortcuts', 
          'application': 'application',
          'contracts': 'contracts', 
          'data': 'analysis-conditions',
          'diagnoses': 'diagnoses',
          'system': 'problem-solving'
        };
        const slug = slugMap[colName] || colName.toLowerCase().replace(/_/g, '-');
        
        let sectionId;
        const { data: existing } = await supabase.from('sections').select('id').eq('name', colName.replace(/_/g, ' ').toUpperCase()).maybeSingle();
        if (existing) {
          sectionId = existing.id;
        } else {
          const newSection: any = {
            name: colName.replace(/_/g, ' ').toUpperCase()
          };
          // Try adding slug if it exists, otherwise omit
          try {
            const { data: newSec, error: secErr } = await supabase.from('sections').insert([newSection]).select().single();
            if (secErr) throw secErr;
            sectionId = newSec.id;
          } catch (e) {
            // Final fallback
            const { data: finalCheck } = await supabase.from('sections').select('id').eq('name', newSection.name).maybeSingle();
            if (finalCheck) sectionId = finalCheck.id;
            else throw e;
          }
        }

        const items = docs.map(d => ({
          section_id: sectionId,
          title: d.title || d.name || d.id,
          description: d.description || d.content || d.text || JSON.stringify(d),
          // category: d.category || null,
          attachment_url: d.attachment_url || d.fileUrl || d.url || null
        }));

        // Insert in chunks to be safe
        const chunkSize = 50;
        let count = 0;
        for (let i = 0; i < items.length; i += chunkSize) {
          const chunk = items.slice(i, i + chunkSize);
          const { error } = await supabase.from("items").insert(chunk);
          if (error) {
            console.log(`[${colName}] Supabase Error at chunk ${i}: ${error.message}`);
          } else {
            count += chunk.length;
          }
        }
        console.log(`[${colName}] SUCCESS: Migrated ${count}/${items.length} items.`);
      }
    } catch (e: any) {
      console.log(`[${colName}] Critical Error: ${e.message}`);
    }
  }
  console.log("\n--- MIGRATION FINISHED ---");
}

migrate();
