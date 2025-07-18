
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const useCategories = () => {
  const { user } = useAuth();
  
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      console.log('Fetching categories for user:', user?.id);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data);
      return data as Category[];
    },
    enabled: !!user,
  });

  return {
    categories,
    isLoading,
  };
};
