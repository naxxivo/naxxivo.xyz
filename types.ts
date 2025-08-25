import type { Database } from './integrations/supabase/types';

export type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories: Pick<Database['public']['Tables']['categories']['Row'], 'name'> | null;
};

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];