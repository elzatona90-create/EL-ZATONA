import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  // Basic URL validation
  const isValidUrl = (string: string) => {
    try {
      const u = new URL(string);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  if (!url || !isValidUrl(url) || !key || key === 'your_supabase_anon_key') {
    return {
      url: 'https://placeholder-project.supabase.co',
      key: 'placeholder-key',
      isPlaceholder: true
    };
  }

  return { url, key, isPlaceholder: false };
};

const config = getSupabaseConfig();

if (config.isPlaceholder) {
  console.warn("⚠️ Supabase credentials are missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
}

export const isPlaceholder = config.isPlaceholder;
export const supabase = createClient(config.url, config.key);

