import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('cities').select('*').order('name').then(({ data }) => {
      if (data) setCities(data as City[]);
      setLoading(false);
    });
  }, []);

  return { cities, loading };
}
