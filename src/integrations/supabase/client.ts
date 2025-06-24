
// Compatibility layer for Supabase - all functionality moved to Berget.ai
import { bergetClient } from '@/integrations/berget/client';

// Mock Supabase-like interface for compatibility with existing code
export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } })
      }),
      order: (column: string, options?: any) => Promise.resolve({ data: [], error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } })
    }),
    upsert: (data: any) => Promise.resolve({ data: null, error: { message: 'Functionality moved to Berget.ai - use bergetClient instead' } })
  }),
  functions: {
    invoke: (functionName: string, options?: any) => 
      Promise.resolve({ data: null, error: { message: 'Edge functions moved to Berget.ai - use bergetClient instead' } })
  },
  channel: (name: string) => ({
    on: (event: string, config: any, callback: Function) => ({ subscribe: () => {} }),
    subscribe: () => {}
  }),
  removeChannel: (channel: any) => {}
};
