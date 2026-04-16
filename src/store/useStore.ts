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
  
  // Auth
  setUser: (user: any) => void;
  logout: () => void;
  updateCurrentUser: (data: any) => Promise<void>;

  // Data
  fetchData: (force?: boolean) => Promise<void>;
  seedSections: () => Promise<void>;
  
  // Sections
  addSection: (section: any) => Promise<void>;
  updateSection: (id: string, section: any) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Items
  addItem: (item: any) => Promise<void>;
  updateItem: (id: string, item: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Prices
  addPrice: (price: any) => Promise<void>;
  updatePrice: (id: string, price: any) => Promise<void>;
  deletePrice: (id: string) => Promise<void>;

  // Favorites
  toggleFavorite: (itemId: string) => Promise<void>;

  // Search Logs
  logSearch: (term: string, section?: string) => void;
  syncSearchLogs: () => Promise<void>;

  // Attachments
  addAttachment: (name: string, url: string, size: number, item_id?: string, section_id?: string) => Promise<void>;
  deleteAttachment: (id: string) => Promise<void>;

  // Users
  addUser: (userData: any) => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // UI
  setTheme: (theme: 'teal' | 'pink' | 'blue') => void;
  setLanguage: (lang: 'en' | 'ar') => void;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SYNC_INTERVAL = 60 * 1000; // 60 seconds

let searchLogQueue: { term: string; section?: string; user_id?: string }[] = [];

export const useStore = create<AppState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('el_zatona_user') || 'null'),
  sections: JSON.parse(localStorage.getItem('el_zatona_sections') || '[]'),
  items: [], // Don't load large datasets from localStorage
  prices: [],
  favorites: JSON.parse(localStorage.getItem('el_zatona_favorites') || '[]'),
  searchLogs: [],
  attachments: [],
  users: [],
  lastFetch: Number(localStorage.getItem('el_zatona_last_fetch') || '0'),
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
    if (!user) return;
    const { error } = await supabase.from('users').update(data).eq('id', user.id);
    if (!error) {
      const updatedUser = { ...user, ...data };
      get().setUser(updatedUser);
    }
  },

  fetchData: async (force = false) => {
    const { lastFetch, isFetching } = get();
    if (isFetching) return;

    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; 

    if (!force && now - lastFetch < CACHE_DURATION && get().sections.length > 0) {
      return;
    }

    set({ isFetching: true });

    try {
      const [
        { data: sections },
        { data: items },
        { data: prices },
        { data: favorites },
        { data: searchLogs },
        { data: attachments },
        { data: users }
      ] = await Promise.all([
        supabase.from('sections').select('*'),
        supabase.from('items').select('*'),
        supabase.from('prices').select('*'),
        supabase.from('favorites').select('*'),
        supabase.from('search_logs').select('*'),
        supabase.from('attachments').select('*'),
        supabase.from('users').select('*')
      ]);

      // If no sections, seed them in background
      if (!sections || sections.length === 0) {
        get().seedSections();
      }

      const dataMap = {
        sections: sections || [],
        items: items || [],
        prices: prices || [],
        favorites: favorites || [],
        searchLogs: searchLogs || [],
        attachments: attachments || [],
        users: users || [],
        lastFetch: now,
        isFetching: false
      };

      Object.entries(dataMap).forEach(([key, value]) => {
        // Only cache small, essential datasets in localStorage
        // Large datasets (items, prices, attachments, searchLogs, users) are excluded to avoid quota errors
        if (['sections', 'favorites', 'lastFetch'].includes(key)) {
          localStorage.setItem(`el_zatona_${key}`, JSON.stringify(value));
        } else {
          // Explicitly remove large keys to free up space
          localStorage.removeItem(`el_zatona_${key}`);
        }
      });

      set(dataMap);

      // Set up real-time subscriptions if not already set
      if (!(window as any).supabaseSubscriptions) {
        (window as any).supabaseSubscriptions = true; // Set flag immediately to avoid race conditions
        
        supabase
          .channel('schema-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, () => get().fetchData(true))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => get().fetchData(true))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'prices' }, () => get().fetchData(true))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => get().fetchData(true))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'attachments' }, () => get().fetchData(true))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => get().fetchData(true))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'search_logs' }, () => get().fetchData(true))
          .subscribe();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      set({ isFetching: false });
    }
  },

  seedSections: async () => {
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
    
    const { error } = await supabase.from('sections').insert(initialSections);
    if (error) {
      console.error("Error seeding sections:", error);
      // Fallback to local if supabase fails
      const currentSections = get().sections;
      const newSections = [...currentSections];
      initialSections.forEach(is => {
        if (!newSections.find(s => s.slug === is.slug)) {
          newSections.push({ ...is, id: crypto.randomUUID() });
        }
      });
      set({ sections: newSections });
      localStorage.setItem('el_zatona_sections', JSON.stringify(newSections));
    } else {
      await get().fetchData(true);
    }
  },

  addSection: async (section) => {
    const sectionWithId = { ...section, id: crypto.randomUUID() };
    const { error } = await supabase.from('sections').insert([section]);
    
    // Always update local state for immediate feedback and offline support
    const newSections = [...get().sections, sectionWithId];
    set({ sections: newSections });
    localStorage.setItem('el_zatona_sections', JSON.stringify(newSections));
    
    if (!error) get().fetchData(true);
  },

  updateSection: async (id, section) => {
    const { error } = await supabase.from('sections').update(section).eq('id', id);
    
    const newSections = get().sections.map(s => s.id === id ? { ...s, ...section } : s);
    set({ sections: newSections });
    localStorage.setItem('el_zatona_sections', JSON.stringify(newSections));
    
    if (!error) get().fetchData(true);
  },

  deleteSection: async (id) => {
    const { error } = await supabase.from('sections').delete().eq('id', id);
    
    const newSections = get().sections.filter(s => s.id !== id);
    set({ sections: newSections });
    localStorage.setItem('el_zatona_sections', JSON.stringify(newSections));
    
    if (!error) get().fetchData(true);
  },

  addItem: async (item) => {
    const itemWithId = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const { error } = await supabase.from('items').insert([item]);
    
    const newItems = [...get().items, itemWithId];
    set({ items: newItems });
    
    if (!error) get().fetchData(true);
  },

  updateItem: async (id, item) => {
    const { error } = await supabase.from('items').update(item).eq('id', id);
    
    const newItems = get().items.map(i => i.id === id ? { ...i, ...item } : i);
    set({ items: newItems });
    
    if (!error) get().fetchData(true);
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    
    const newItems = get().items.filter(i => i.id !== id);
    set({ items: newItems });
    
    if (!error) get().fetchData(true);
  },

  addPrice: async (price) => {
    const priceWithId = { ...price, id: crypto.randomUUID() };
    const { error } = await supabase.from('prices').insert([price]);
    
    const newPrices = [...get().prices, priceWithId];
    set({ prices: newPrices });
    
    if (!error) get().fetchData(true);
  },

  updatePrice: async (id, price) => {
    const { error } = await supabase.from('prices').update(price).eq('id', id);
    
    const newPrices = get().prices.map(p => p.id === id ? { ...p, ...price } : p);
    set({ prices: newPrices });
    
    if (!error) get().fetchData(true);
  },

  deletePrice: async (id) => {
    const { error } = await supabase.from('prices').delete().eq('id', id);
    
    const newPrices = get().prices.filter(p => p.id !== id);
    set({ prices: newPrices });
    
    if (!error) get().fetchData(true);
  },

  toggleFavorite: async (itemId) => {
    const { user, favorites } = get();
    if (!user) return;

    const existing = favorites.find(f => f.item_id === itemId && f.user_id === user.id);
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      const newFavorites = favorites.filter(f => f.id !== existing.id);
      set({ favorites: newFavorites });
      localStorage.setItem('el_zatona_favorites', JSON.stringify(newFavorites));
    } else {
      const newFav = { id: crypto.randomUUID(), user_id: user.id, item_id: itemId };
      await supabase.from('favorites').insert([newFav]);
      const newFavorites = [...favorites, newFav];
      set({ favorites: newFavorites });
      localStorage.setItem('el_zatona_favorites', JSON.stringify(newFavorites));
    }
    get().fetchData(true);
  },

  logSearch: (term, section) => {
    const { user } = get();
    searchLogQueue.push({ term, section, user_id: user?.id });
  },

  syncSearchLogs: async () => {
    if (searchLogQueue.length === 0) return;
    
    const logs = [...searchLogQueue];
    searchLogQueue = [];

    // Group by term and section to increment counts if needed, 
    // but for analytics we might want individual logs or a summary.
    // Here we just insert them.
    const { error } = await supabase.from('search_logs').insert(logs.map(l => ({
      search_term: l.term,
      section: l.section,
      user_id: l.user_id
    })));

    if (error) {
      console.error("Error syncing search logs:", error);
      searchLogQueue = [...logs, ...searchLogQueue];
    } else {
      get().fetchData(true);
    }
  },

  addAttachment: async (name, url, size, item_id, section_id) => {
    const { user } = get();
    const { error } = await supabase.from('attachments').insert([{ 
      name, 
      url, 
      size, 
      uploaded_by: user?.id,
      item_id,
      section_id
    }]);
    if (!error) get().fetchData(true);
  },

  deleteAttachment: async (id) => {
    const { error } = await supabase.from('attachments').delete().eq('id', id);
    if (!error) get().fetchData(true);
  },

  addUser: async (userData) => {
    const userWithId = { ...userData, id: crypto.randomUUID() };
    const { error } = await supabase.from('users').insert([userData]);
    
    const newUsers = [...get().users, userWithId];
    set({ users: newUsers });
    
    if (!error) get().fetchData(true);
  },

  updateUser: async (id, userData) => {
    const { error } = await supabase.from('users').update(userData).eq('id', id);
    
    const newUsers = get().users.map(u => u.id === id ? { ...u, ...userData } : u);
    set({ users: newUsers });
    
    if (!error) get().fetchData(true);
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    
    const newUsers = get().users.filter(u => u.id !== id);
    set({ users: newUsers });
    
    if (!error) get().fetchData(true);
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

// Start sync interval
setInterval(() => {
  useStore.getState().syncSearchLogs();
}, SYNC_INTERVAL);
