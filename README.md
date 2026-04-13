# EL ZATONA Dashboard (Supabase Edition)

A high-performance React + TypeScript dashboard with neon aesthetic, RTL support, and advanced caching.

## Setup Instructions

### 1. Supabase Project Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `schema.sql` (found in this project).
3. Go to **Project Settings > API** and copy your `URL` and `anon public` key.

### 2. Environment Variables
Create a `.env` file in the root directory (or use the platform's Secrets panel) with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

## Features
- **Neon Design**: Teal, Pink, and Blue themes with glassmorphism.
- **RTL Support**: Full Arabic support with automatic layout switching.
- **Advanced Caching**: 24-hour local caching for zero-quota issues.
- **AI Assistant**: Search assistant powered by Google Gemini.
- **Role-Based Access**: Admin and User dashboards.

## Branding
- **Design By**: ISLAM AL SAPAA
- **Content Developed By**: KIH
