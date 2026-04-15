import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocsFromServer } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
const dbNamed = initializeFirestore(app, {}, "ai-studio-ab67db85-1709-4e04-8f2d-b9966c51bb60");
const dbDefault = initializeFirestore(app, {});

let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
    let supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
    
    // Robust Auto-fix
    if (supabaseKey.startsWith('http') && !supabaseUrl.startsWith('http')) {
      const temp = supabaseUrl;
      supabaseUrl = supabaseKey;
      supabaseKey = temp;
    }
    
    // If Key is still a URL, it's definitely wrong
    if (supabaseKey.startsWith('http')) {
      console.error("Supabase Key looks like a URL. This will fail.");
      return null;
    }

    const isValidUrl = (string: string) => {
      try {
        const u = new URL(string);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch (_) {
        return false;
      }
    };

    if (!supabaseUrl || !isValidUrl(supabaseUrl) || !supabaseKey || supabaseKey.length < 20) {
      console.error("Supabase credentials invalid or missing.");
      return null;
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

async function startServer() {
  const server = express();
  const PORT = 3000;

  server.use(express.json());

  // API routes FIRST
  server.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Migration API - Full Server-Side Migration
  server.post("/api/migrate/:collection", async (req, res) => {
    const { collection: collectionName } = req.params;
    const { dbSource = 'named', testOnly = false } = req.body;
    
    console.log(`[MIGRATION] Server-side starting for: ${collectionName} (${dbSource}) ${testOnly ? '[TEST ONLY]' : ''}`);

    try {
      const supabase = getSupabase();
      if (!supabase && !testOnly) {
        const key = process.env.VITE_SUPABASE_ANON_KEY || '';
        let msg = "Supabase is not configured.";
        if (key.startsWith('http')) {
          msg = "CRITICAL CONFIG ERROR: Your Supabase Anon Key is a URL. Please go to Supabase -> Settings -> API and copy the 'anon public' key (a long string of characters), then paste it into the VITE_SUPABASE_ANON_KEY setting.";
        }
        return res.status(400).json({ success: false, message: msg });
      }

      const db = dbSource === 'named' ? dbNamed : dbDefault;
      console.log(`[MIGRATION] Fetching ${collectionName} from Firebase...`);

      const fetchPromise = getDocsFromServer(collection(db, collectionName));
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Connection Timeout (30s)")), 30000));
      const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      const docs = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      console.log(`[MIGRATION] Found ${docs.length} documents.`);

      if (testOnly) {
        return res.json({ success: true, count: docs.length });
      }

      if (docs.length === 0) {
        return res.json({ success: true, count: 0, message: 'No records found' });
      }

      let successCount = 0;
      const errors: string[] = [];

      // Helper to handle Supabase errors
      const handleSupabaseError = (err: any) => {
        console.error(`Supabase Error for ${collectionName}:`, err.message);
        if (err.message.includes('API key') || err.message.includes('invalid api key')) {
          throw new Error("CRITICAL: Supabase API Key is invalid. Please go to Supabase Settings -> API and copy the 'anon public' key correctly.");
        }
        errors.push(err.message);
      };

      if (collectionName === 'users') {
        const usersToInsert = docs.map((doc: any) => {
          const u: any = {
            username: doc.username || doc.email || doc.id,
            password: doc.password || '123456',
            role: doc.role === 'admin' ? 'admin' : 'user'
          };
          // Only add if we think they might exist or just use upsert
          return u;
        });
        
        // Deduplicate
        const uniqueUsers = Array.from(new Map(usersToInsert.map((item: any) => [item.username, item])).values());
        
        const { error } = await supabase.from('users').upsert(uniqueUsers, { onConflict: 'username' });
        if (error) handleSupabaseError(error);
        else successCount = uniqueUsers.length;
      } else if (collectionName === 'files') {
        const filesToInsert = docs.map((doc: any) => ({
          name: doc.name || doc.title || 'Untitled',
          url: doc.url || doc.fileUrl || '',
          size: doc.size || 0
        }));
        const { error } = await supabase.from('attachments').insert(filesToInsert);
        if (error) handleSupabaseError(error);
        else successCount = filesToInsert.length;
      } else {
        const slugMap: Record<string, string> = {
          'analysis_shortcuts': 'analysis-shortcuts',
          'application': 'application',
          'contracts': 'contracts',
          'data': 'analysis-conditions',
          'diagnoses': 'diagnoses',
          'system': 'problem-solving'
        };
        const slug = slugMap[collectionName] || collectionName.toLowerCase().replace(/_/g, '-');
        
        // Ensure section exists
        let sectionId;
        const { data: existing } = await supabase.from('sections').select('id').eq('slug', slug).maybeSingle();
        if (existing) {
          sectionId = existing.id;
        } else {
          const newSection: any = {
            name: collectionName.replace(/_/g, ' ').toUpperCase(),
            slug: slug
          };
          
          const { data: newSec, error: secErr } = await supabase.from('sections').insert([newSection]).select().single();
          if (secErr) {
            // Fallback if slug is missing from schema
            const { data: fallbackSec, error: fallbackErr } = await supabase.from('sections').insert([{
              name: collectionName.replace(/_/g, ' ').toUpperCase()
            }]).select().single();
            if (fallbackErr) throw new Error(`Failed to create section: ${fallbackErr.message}`);
            sectionId = fallbackSec.id;
          } else {
            sectionId = newSec.id;
          }
        }

        const itemsToInsert = docs.map((doc: any) => ({
          section_id: sectionId,
          title: doc.title || doc.name || doc.id || 'Untitled',
          description: doc.description || doc.content || doc.text || JSON.stringify(doc),
          category: doc.category || null,
          attachment_url: doc.attachment_url || doc.fileUrl || doc.url || null
        }));

        const chunkSize = 50;
        for (let i = 0; i < itemsToInsert.length; i += chunkSize) {
          const chunk = itemsToInsert.slice(i, i + chunkSize);
          const { error } = await supabase.from('items').insert(chunk);
          if (error) {
            handleSupabaseError(error);
          } else {
            successCount += chunk.length;
          }
        }
      }

      res.json({ success: true, count: successCount, errors });
    } catch (error: any) {
      console.error(`Migration error:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    server.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    server.use(express.static(distPath));
    server.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
