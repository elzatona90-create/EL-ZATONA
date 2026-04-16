import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBBZGhqjs_2d28WCmn6nohEJzo5nDcloQc",
  authDomain: "gen-lang-client-0224072413.firebaseapp.com",
  projectId: "gen-lang-client-0224072413",
  firestoreDatabaseId: "ai-studio-ab67db85-1709-4e04-8f2d-b9966c51bb60"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-ab67db85-1709-4e04-8f2d-b9966c51bb60");

const COLLECTIONS = [
  'analysis_shortcuts',
  'application',
  'contracts',
  'data',
  'diagnoses',
  'files',
  'searchHistory',
  'searchLog',
  'system',
  'users'
];

export default function MigrationPage() {
  const [status, setStatus] = useState<Record<string, { state: 'pending' | 'migrating' | 'success' | 'error', message?: string, count?: number }>>({});
  const [isMigrating, setIsMigrating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { sections, fetchData } = useStore();

  useEffect(() => {
    const initialStatus: any = {};
    COLLECTIONS.forEach(c => {
      initialStatus[c] = { state: 'pending' };
    });
    setStatus(initialStatus);
  }, []);

  const getOrCreateSection = async (collectionName: string) => {
    // Try to find existing section
    const slugMap: Record<string, string> = {
      'analysis_shortcuts': 'analysis-shortcuts',
      'application': 'application',
      'contracts': 'contracts',
      'data': 'analysis-conditions', // Guessing mapping
      'diagnoses': 'diagnoses',
      'system': 'problem-solving' // Guessing mapping
    };
    
    const slug = slugMap[collectionName] || collectionName.toLowerCase().replace(/_/g, '-');
    
    let section = sections.find(s => s.slug === slug);
    if (section) return section.id;

    // Create if not exists
    const { data, error } = await supabase.from('sections').insert([{
      name: collectionName.replace(/_/g, ' ').toUpperCase(),
      slug: slug,
      emoji: '📁'
    }]).select().single();

    if (error) throw error;
    await fetchData(true); // Refresh store
    return data.id;
  };

  const migrateCollection = async (collectionName: string) => {
    setStatus(prev => ({ ...prev, [collectionName]: { state: 'migrating' } }));
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      if (docs.length === 0) {
        setStatus(prev => ({ ...prev, [collectionName]: { state: 'success', count: 0, message: 'Empty collection' } }));
        return;
      }

      let successCount = 0;

      if (collectionName === 'users') {
        for (const doc of docs) {
          const { error } = await supabase.from('users').insert([{
            username: doc.username || doc.email || doc.id,
            password: doc.password || '123456',
            role: doc.role === 'admin' ? 'admin' : 'user',
            display_name: doc.displayName || doc.name || ''
          }]);
          if (!error) successCount++;
        }
      } else if (collectionName === 'files') {
        for (const doc of docs) {
          const { error } = await supabase.from('attachments').insert([{
            name: doc.name || doc.title || 'Untitled',
            url: doc.url || doc.fileUrl || '',
            size: doc.size || 0
          }]);
          if (!error) successCount++;
        }
      } else if (collectionName === 'searchLog' || collectionName === 'searchHistory') {
        for (const doc of docs) {
          const { error } = await supabase.from('search_logs').insert([{
            search_term: doc.term || doc.search_term || doc.query || 'Unknown',
            section: doc.section || null,
            count: doc.count || 1
          }]);
          if (!error) successCount++;
        }
      } else {
        // Treat as items
        const sectionId = await getOrCreateSection(collectionName);
        for (const doc of docs) {
          const { error } = await supabase.from('items').insert([{
            section_id: sectionId,
            title: doc.title || doc.name || doc.id || 'Untitled',
            description: doc.description || doc.content || doc.text || JSON.stringify(doc),
            category: doc.category || null,
            attachment_url: doc.attachment_url || doc.fileUrl || doc.url || null
          }]);
          if (!error) successCount++;
        }
      }

      setStatus(prev => ({ ...prev, [collectionName]: { state: 'success', count: successCount } }));
    } catch (error: any) {
      console.error(`Error migrating ${collectionName}:`, error);
      setStatus(prev => ({ ...prev, [collectionName]: { state: 'error', message: error.message } }));
    }
  };

  const startMigration = async () => {
    setIsMigrating(true);
    setIsComplete(false);
    
    for (const collectionName of COLLECTIONS) {
      await migrateCollection(collectionName);
    }
    
    setIsMigrating(false);
    setIsComplete(true);
    await fetchData(true);
  };

  const progress = Object.values(status).filter((s: any) => s.state === 'success' || s.state === 'error').length;
  const progressPercentage = (progress / COLLECTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-dark-bg p-8 text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = '/'} className="p-2 glass-morphism rounded-xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-6 h-6 text-neon-cyan" />
          </button>
          <h1 className="text-3xl font-black neon-text-cyan tracking-widest">DATA MIGRATION</h1>
        </div>

        <div className="glass-morphism p-8 rounded-[32px] space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Firebase to Supabase</h2>
              <p className="text-gray-400">Migrate {COLLECTIONS.length} collections from the legacy database.</p>
            </div>
            <button
              onClick={startMigration}
              disabled={isMigrating || isComplete}
              className={`px-8 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all ${
                isMigrating || isComplete 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-neon-cyan text-dark-bg hover:bg-white hover:shadow-[0_0_30px_rgba(0,242,255,0.6)]'
              }`}
            >
              {isMigrating ? 'Migrating...' : isComplete ? 'Done' : 'Start Migration'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-neon-cyan">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-neon-cyan transition-all duration-500 shadow-[0_0_20px_rgba(0,242,255,0.8)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status List */}
          <div className="space-y-3">
            {COLLECTIONS.map(collection => (
              <div key={collection} className="flex items-center justify-between p-4 glass-morphism bg-white/5 rounded-xl border border-white/5">
                <span className="font-mono text-neon-magenta">{collection}</span>
                <div className="flex items-center gap-3">
                  {status[collection]?.state === 'pending' && <span className="text-gray-500 text-sm font-bold">Waiting...</span>}
                  {status[collection]?.state === 'migrating' && (
                    <div className="flex items-center gap-2 text-neon-cyan">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-bold">Migrating...</span>
                    </div>
                  )}
                  {status[collection]?.state === 'success' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <span className="text-sm font-bold">{status[collection]?.count} records</span>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                  {status[collection]?.state === 'error' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <span className="text-sm font-bold truncate max-w-[200px]" title={status[collection]?.message}>
                        {status[collection]?.message}
                      </span>
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isComplete && (
            <div className="p-6 glass-morphism bg-green-500/10 border-green-500/30 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-green-400 tracking-widest">MIGRATION COMPLETE!</h3>
              <p className="text-green-400/80">All collections have been processed successfully.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
