import { Domain, FilingStatus, SortOption } from '@/types';

const DOMAINS_KEY = 'dm_domains_cache_v2';
const FILTERS_KEY = 'dm_filters_v1';

export interface CachedFilters {
  searchQuery: string;
  registrarFilter: string;
  filingStatusFilter: FilingStatus;
  sortBy: SortOption;
}

export function readDomainsCache(): Domain[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DOMAINS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.domains) ? parsed.domains : null;
  } catch {
    return null;
  }
}

export function writeDomainsCache(domains: Domain[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      DOMAINS_KEY,
      JSON.stringify({ domains, savedAt: Date.now() })
    );
  } catch {
    // Ignore quota / private-mode failures
  }
}

export function clearDomainsCache(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DOMAINS_KEY);
}

export function readFilterPrefs(): CachedFilters | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedFilters;
  } catch {
    return null;
  }
}

export function writeFilterPrefs(filters: CachedFilters): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // Ignore
  }
}
