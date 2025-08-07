import { useState, useMemo } from 'react';

interface SearchableItem {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export const useSearch = <T extends SearchableItem>(items: T[], searchFields: (keyof T)[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredItems = useMemo(() => {
    let result = items;

    // Aplicar búsqueda por texto
    if (searchTerm) {
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => item[key] === value);
      }
    });

    return result;
  }, [items, searchTerm, filters, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredItems
  };
};