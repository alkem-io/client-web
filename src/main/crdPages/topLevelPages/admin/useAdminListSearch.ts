import { useState } from 'react';

/**
 * Client-side search for admin list sections whose query returns the full set
 * (Spaces, Innovation Packs/Hubs, Virtual Contributors). Filters rows by their
 * `name` — mirroring the MUI admin's client-side `value` filter. Pagination is
 * handled separately by `AdminSearchableTable` in `client` mode.
 */
export const useAdminListSearch = <Row extends { name: string }>(rows: Row[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const term = searchTerm.trim().toLowerCase();
  const filteredRows = term ? rows.filter(row => row.name.toLowerCase().includes(term)) : rows;

  return { searchTerm, onSearchTermChange: setSearchTerm, filteredRows };
};
