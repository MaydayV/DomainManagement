'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Domain, FilingStatus, SortOption } from '@/types';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { DomainList } from '@/components/DomainList';
import { DomainForm } from '@/components/DomainForm';
import { StatsPanel } from '@/components/StatsPanel';
import { ImportExportPanel } from '@/components/ImportExportPanel';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/PageSkeleton';
import { apiWithRetry } from '@/lib/api-retry';
import { filterAndSortDomains } from '@/lib/domain-query';
import {
  readDomainsCache,
  writeDomainsCache,
  readFilterPrefs,
  writeFilterPrefs,
  clearDomainsCache,
} from '@/lib/client-cache';
import {
  authHeaders,
  clearAuthToken,
  isTokenValid,
  readAuthToken,
} from '@/lib/auth-client';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const cachedDomains = useMemo(() => readDomainsCache() ?? [], []);
  const savedFilters = useMemo(() => readFilterPrefs(), []);

  const [allDomains, setAllDomains] = useState<Domain[]>(cachedDomains);
  const [loading, setLoading] = useState(cachedDomains.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(savedFilters?.searchQuery ?? '');
  const [registrarFilter, setRegistrarFilter] = useState(savedFilters?.registrarFilter ?? '');
  const [filingStatusFilter, setFilingStatusFilter] = useState<FilingStatus>(
    savedFilters?.filingStatusFilter ?? ''
  );
  const [sortBy, setSortBy] = useState<SortOption>(savedFilters?.sortBy ?? 'expiry-asc');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const redirectToLogin = useCallback(() => {
    clearAuthToken();
    clearDomainsCache();
    router.replace(`/${locale}/login`);
  }, [locale, router]);

  useEffect(() => {
    const token = readAuthToken();
    if (!isTokenValid(token)) {
      redirectToLogin();
      return;
    }
    setAuthToken(token as string);
  }, [redirectToLogin]);

  const fetchDomains = useCallback(
    async (token: string, silent = false) => {
      if (!silent && allDomains.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await fetch('/api/domains', {
          headers: authHeaders(token),
          cache: 'no-store',
        });

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        const data = await response.json();
        if (data.success) {
          setAllDomains(data.data);
          writeDomainsCache(data.data);
          setError('');
        } else {
          setError(data.error || t('message.operationFailed'));
        }
      } catch {
        if (allDomains.length === 0) {
          setError(t('message.networkError'));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [allDomains.length, redirectToLogin, t]
  );

  useEffect(() => {
    if (!authToken) return;
    fetchDomains(authToken, allDomains.length > 0);
    // Initial load only when token becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    writeFilterPrefs({
      searchQuery,
      registrarFilter,
      filingStatusFilter,
      sortBy,
    });
  }, [searchQuery, registrarFilter, filingStatusFilter, sortBy]);

  const visibleDomains = useMemo(
    () =>
      filterAndSortDomains(
        allDomains,
        {
          searchQuery,
          registrar: registrarFilter,
          filingStatus: filingStatusFilter,
        },
        sortBy
      ),
    [allDomains, searchQuery, registrarFilter, filingStatusFilter, sortBy]
  );

  const hasActiveFilters = Boolean(searchQuery || registrarFilter || filingStatusFilter);

  const handleLogout = () => {
    redirectToLogin();
  };

  const handleAddDomain = () => {
    setEditingDomain(null);
    setSubmitError('');
    setIsFormOpen(true);
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setSubmitError('');
    setIsFormOpen(true);
  };

  const handleImportDomains = async (importedDomains: Partial<Domain>[]) => {
    const response = await fetch('/api/domains/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(authToken),
      },
      body: JSON.stringify({ domains: importedDomains }),
    });

    if (response.status === 401) {
      redirectToLogin();
      throw new Error('Unauthorized');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || t('message.importFailed'));
    }

    await fetchDomains(authToken, true);
    return {
      added: result.data.addedCount as number,
      skipped: result.data.skippedCount as number,
    };
  };

  const handleSubmitDomain = async (data: Partial<Domain>) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const url = editingDomain ? `/api/domains/${editingDomain.id}` : '/api/domains';
      const method = editingDomain ? 'PUT' : 'POST';

      const result = await apiWithRetry(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(authToken),
          },
          body: JSON.stringify(data),
        },
        {
          maxRetries: 2,
          baseDelay: 1000,
          timeout: 15000,
        }
      );

      if (result.success) {
        setIsFormOpen(false);
        setEditingDomain(null);
        setOpenMenuId(null);

        if (!editingDomain && result.data) {
          setAllDomains((prev) => {
            const next = [...prev, result.data as Domain];
            writeDomainsCache(next);
            return next;
          });
        } else if (editingDomain && result.data) {
          setAllDomains((prev) => {
            const next = prev.map((d) =>
              d.id === editingDomain.id ? (result.data as Domain) : d
            );
            writeDomainsCache(next);
            return next;
          });
        }

        fetchDomains(authToken, true);
      } else {
        setSubmitError(result.error || t('message.operationFailed'));
      }
    } catch {
      setSubmitError(t('message.networkDelayWarning'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDomain) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/domains/${deletingDomain.id}`, {
        method: 'DELETE',
        headers: authHeaders(authToken),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const result = await response.json();
      if (result.success) {
        setAllDomains((prev) => {
          const next = prev.filter((d) => d.id !== deletingDomain.id);
          writeDomainsCache(next);
          return next;
        });
        setDeletingDomain(null);
      }
    } catch (err) {
      console.error('Failed to delete domain:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && allDomains.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 overflow-hidden bg-primary-100">
          <div className="h-full w-1/3 bg-primary-600 animate-progress" />
        </div>
      )}

      <Header onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <StatsPanel domains={allDomains} locale={locale} />

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => fetchDomains(authToken)}>
              {t('common.retry')}
            </Button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="w-full lg:w-80">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex-1 w-full lg:w-auto">
              <FilterBar
                registrar={registrarFilter}
                filingStatus={filingStatusFilter}
                sortBy={sortBy}
                onRegistrarChange={setRegistrarFilter}
                onFilingStatusChange={setFilingStatusFilter}
                onSortChange={setSortBy}
                locale={locale}
                domains={allDomains}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ImportExportPanel
                domains={allDomains}
                onImport={handleImportDomains}
                locale={locale}
              />

              <Button variant="primary" onClick={handleAddDomain} size="md">
                <Plus className="w-4 h-4 mr-2" />
                {t('domain.addDomain')}
              </Button>
            </div>
          </div>
        </div>

        <DomainList
          domains={visibleDomains}
          onEdit={handleEditDomain}
          onDelete={setDeletingDomain}
          locale={locale}
          openMenuId={openMenuId}
          onMenuToggle={setOpenMenuId}
          hasFilters={hasActiveFilters}
        />
      </main>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          if (submitting) return;
          setIsFormOpen(false);
          setEditingDomain(null);
        }}
        title={editingDomain ? t('domain.editDomain') : t('domain.addDomain')}
      >
        <DomainForm
          domain={editingDomain}
          onSubmit={handleSubmitDomain}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingDomain(null);
            setSubmitError('');
          }}
          locale={locale}
          isSubmitting={submitting}
          submitError={submitError}
        />
      </Modal>

      <Modal
        isOpen={!!deletingDomain}
        onClose={() => !deleting && setDeletingDomain(null)}
        title={t('domain.deleteDomain')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">{t('domain.deleteConfirm')}</p>
          <p className="font-medium text-slate-900">{deletingDomain?.name}</p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              className="flex-1"
              disabled={deleting}
            >
              {deleting ? t('common.loading') : t('common.delete')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeletingDomain(null)}
              disabled={deleting}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
