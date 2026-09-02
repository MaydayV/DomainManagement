import { Domain, FilterOptions, SortOption } from '@/types';

export function filterAndSortDomains(
  domains: Domain[],
  filters: FilterOptions = {},
  sort: SortOption = 'expiry-asc'
): Domain[] {
  let result = [...domains];

  if (filters.registrar) {
    result = result.filter((d) => d.registrar === filters.registrar);
  }

  if (filters.filingStatus) {
    result = result.filter((d) => d.filingStatus === filters.filingStatus);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.registrar.toLowerCase().includes(query) ||
        d.notes?.toLowerCase().includes(query)
    );
  }

  result.sort((a, b) => {
    switch (sort) {
      case 'expiry-asc':
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      case 'expiry-desc':
        return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'created-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return result;
}
