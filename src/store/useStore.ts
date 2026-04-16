import { create } from 'zustand';
import { supabase, isPlaceholder } from '../lib/supabase';

interface AppState {
  user: any | null;
  sections: any[];
  items: any[];
  prices: any[];
  favorites: any[];
  searchLogs: any[];
  attachments: any[];
  users: any[];
  lastFetch: number;
  isFetching: boolean;
  theme: 'teal' | 'pink' | 'blue';
  language: 'en' | 'ar';
  
  setUser: (user: any) => void;
  logout: () => void;
  updateCurrentUser: (data: any) => Promise<void>;
  fetchData: () => void;
  seedSections: () => Promise<void>;
  addSection: (section: any) => Promise<void>;
  updateSection: (id: string, section: any) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  addItem: (item: any) => Promise<void>;
  updateItem: (id: string, item: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addPrice: (price: any) => Promise<void>;
  updatePrice: (id: string, price: any) => Promise<void>;
  deletePrice: (id: string) => Promise<void>;
  toggleFavorite: (itemId: string) => Promise<void>;
  logSearch: (term: string, section?: string) => void;
  syncSearchLogs: () => Promise<void>;
  addAttachment: (name: string, url: string, size: number, item_id?: string, section_id?: string) => Promise<void>;
  deleteAttachment: (id: string) => Promise<void>;
  addUser: (userData: any) => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setTheme: (theme: 'teal' | 'pink' | 'blue') => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  initializeRealtime: () => void;
}

const SYNC_INTERVAL = 60 * 1000;
let searchLogQueue: any[] = [];

export const useStore = create<AppState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('el_zatona_user') || 'null'),
  sections: [],
  items: [],
  prices: [],
  favorites: [],
  searchLogs: [],
  attachments: [],
  users: [],
  lastFetch: 0,
  isFetching: false,
  theme: (localStorage.getItem('el_zatona_theme') as any) || 'teal',
  language: (localStorage.getItem('el_zatona_lang') as any) || 'en',

  setUser: (user) => {
    localStorage.setItem('el_zatona_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('el_zatona_user');
    set({ user: null });
  },

  updateCurrentUser: async (data) => {
    const { user } = get();
    if (!user?.id || isPlaceholder) return;
    try {
      const { data: updated, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      get().setUser(updated);
    } catch (e) {
      console.error('Supabase Update Error:', e);
    }
  },

  fetchData: () => {
    if (isPlaceholder) {
      console.warn("Supabase is in placeholder mode. Real-time data will not be fetched.");
      return;
    }

    const tables = ['sections', 'items', 'prices', 'favorites', 'attachments', 'users', 'search_logs'];
    
    // Initial fetch for all tables
    tables.forEach(async (table) => {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const stateKey = table === 'search_logs' ? 'searchLogs' : table;
        set({ [stateKey]: data } as any);
        
        if (table === 'sections' && data.length === 0) {
          get().seedSections();
        }
      }
    });
  },

  initializeRealtime: () => {
    if (isPlaceholder) return;
    
    // Real-time subscription
    supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const { table, eventType, new: newRecord, old: oldRecord } = payload;
        const stateKey = table === 'search_logs' ? 'searchLogs' : (table as string);
        const currentData = (get() as any)[stateKey] || [];

        let updatedData = [...currentData];
        if (eventType === 'INSERT') {
          updatedData = [newRecord, ...updatedData];
        } else if (eventType === 'UPDATE') {
          updatedData = updatedData.map((item: any) => item.id === newRecord.id ? newRecord : item);
        } else if (eventType === 'DELETE') {
          updatedData = updatedData.filter((item: any) => item.id !== oldRecord.id);
        }

        set({ [stateKey]: updatedData } as any);
      })
      .subscribe();
  },

  seedSections: async () => {
    if (isPlaceholder) return;
    const initialSections = [
      { title: 'Contracts', emoji: '📄', slug: 'contracts' },
      { title: 'Prices', emoji: '💰', slug: 'prices' },
      { title: 'Analysis Conditions', emoji: '🧪', slug: 'conditions' },
      { title: 'Analysis Shortcuts', emoji: '🔬', slug: 'shortcuts' },
      { title: 'Problem Solving', emoji: '🔧', slug: 'problems' },
      { title: 'Application', emoji: '📱', slug: 'application' },
      { title: 'Diagnoses', emoji: '🏥', slug: 'diagnoses' },
      { title: 'Question Bank', emoji: '❓', slug: 'questions' },
      { title: 'Applications Section', emoji: '📂', slug: 'applications_section' }
    ];
    
    // Check if sections already exist to avoid double seeding
    const { data: existing } = await supabase.from('sections').select('slug');
    const existingSlugs = new Set(existing?.map(s => s.slug) || []);
    
    const toInsert = initialSections.filter(s => !existingSlugs.has(s.slug));
    if (toInsert.length > 0) {
      const { error } = await supabase.from('sections').insert(toInsert);
      if (error) console.error('Supabase Seed Error:', error);
    }
  },

  addSection: async (section) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('sections').insert([section]);
    if (error) console.error('Supabase Insert Error:', error);
  },

  updateSection: async (id, section) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('sections').update(section).eq('id', id);
    if (error) console.error('Supabase Update Error:', error);
  },

  deleteSection: async (id) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  },

  addItem: async (item) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('items').insert([{ ...item, created_at: new Date().toISOString() }]);
    if (error) console.error('Supabase Insert Error:', error);
  },

  updateItem: async (id, item) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('items').update(item).eq('id', id);
    if (error) console.error('Supabase Update Error:', error);
  },

  deleteItem: async (id) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  },

  addPrice: async (price) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('prices').insert([price]);
    if (error) console.error('Supabase Insert Error:', error);
  },

  updatePrice: async (id, price) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('prices').update(price).eq('id', id);
    if (error) console.error('Supabase Update Error:', error);
  },

  deletePrice: async (id) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('prices').delete().eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  },

  toggleFavorite: async (itemId) => {
    if (isPlaceholder) return;
    const { user, favorites } = get();
    if (!user?.id) return;

    const existing = favorites.find(f => f.item_id === itemId && f.user_id === user.id);
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, item_id: itemId }]);
    }
  },

  logSearch: (term, section) => {
    const { user } = get();
    searchLogQueue.push({ search_term: term, section, user_id: user?.id, last_searched_at: new Date().toISOString() });
  },

  syncSearchLogs: async () => {
    if (isPlaceholder || searchLogQueue.length === 0) return;
    const logs = [...searchLogQueue];
    searchLogQueue = [];
    
    for (const log of logs) {
      const { data: existing } = await supabase
        .from('search_logs')
        .select('*')
        .eq('search_term', log.search_term)
        .eq('user_id', log.user_id)
        .single();

      if (existing) {
        await supabase
          .from('search_logs')
          .update({ count: (existing.count || 1) + 1, last_searched_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('search_logs').insert([log]);
      }
    }
  },

  addAttachment: async (name, url, size, item_id, section_id) => {
    if (isPlaceholder) return;
    const { user } = get();
    const { error } = await supabase.from('attachments').insert([{ 
      name, 
      url, 
      size, 
      uploaded_by: user?.id,
      item_id,
      section_id,
      created_at: new Date().toISOString()
    }]);
    if (error) console.error('Supabase Insert Error:', error);
  },

  deleteAttachment: async (id) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('attachments').delete().eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  },

  addUser: async (userData) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('users').insert([userData]);
    if (error) console.error('Supabase Insert Error:', error);
  },

  updateUser: async (id, userData) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('users').update(userData).eq('id', id);
    if (error) console.error('Supabase Update Error:', error);
  },

  deleteUser: async (id) => {
    if (isPlaceholder) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  },

  setTheme: (theme) => {
    localStorage.setItem('el_zatona_theme', theme);
    set({ theme });
  },

  setLanguage: (language) => {
    localStorage.setItem('el_zatona_lang', language);
    set({ language });
  }
}));

setInterval(() => {
  useStore.getState().syncSearchLogs();
}, SYNC_INTERVAL);
