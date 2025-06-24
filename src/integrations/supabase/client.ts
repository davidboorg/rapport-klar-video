
// Replacement for Supabase client using Berget.ai
import { bergetClient } from '@/integrations/berget/client';

// Mock Supabase-like interface for compatibility with existing code
export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase functionality moved to Berget.ai' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase functionality moved to Berget.ai' } }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: { message: 'Supabase functionality moved to Berget.ai' } })
      }),
      order: (column: string, options?: any) => Promise.resolve({ data: [], error: { message: 'Supabase functionality moved to Berget.ai' } })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase functionality moved to Berget.ai' } })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Supabase functionality moved to Berget.ai' } })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Supabase functionality moved to Berget.ai' } })
    }),
    upsert: (data: any) => Promise.resolve({ data: null, error: { message: 'Supabase functionality moved to Berget.ai' } })
  }),
  functions: {
    invoke: (functionName: string, options?: any) => 
      Promise.resolve({ data: null, error: { message: 'Supabase functions moved to Berget.ai' } })
  },
  channel: (name: string) => ({
    on: (event: string, config: any, callback: Function) => ({ subscribe: () => {} }),
    subscribe: () => {}
  }),
  removeChannel: (channel: any) => {}
};
