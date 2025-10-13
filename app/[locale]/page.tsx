'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Domain, SortOption, FilingStatus } from '@/types';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { DomainList } from '@/components/DomainList';
import { DomainForm } from '@/components/DomainForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

import { setRequestLocale } from 'next-intl/server';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  // 设置请求语言环境（修复静态渲染问题）
  setRequestLocale(locale);
  
  const t = useTranslations();
  const router = useRouter();

  // State
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrarFilter, setRegistrarFilter] = useState('');
  const [filingStatusFilter, setFilingStatusFilter] = useState<FilingStatus>('');
  const [sortBy, setSortBy] = useState<SortOption>('expiry-asc');

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null);

  // Auth token
  const [authToken, setAuthToken] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }
    setAuthToken(token);
  }, [locale, router]);

  // Fetch domains
  useEffect(() => {
    if (!authToken) return;

    const fetchDomains = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (registrarFilter) params.append('registrar', registrarFilter);
        if (filingStatusFilter) params.append('filingStatus', filingStatusFilter);
        params.append('sort', sortBy);

        const response = await fetch(`/api/domains?${params}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await response.json();
        if (data.success) {
          setDomains(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch domains:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, [authToken, searchQuery, registrarFilter, filingStatusFilter, sortBy]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push(`/${locale}/login`);
  };

  const handleAddDomain = () => {
    setEditingDomain(null);
    setIsFormOpen(true);
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setIsFormOpen(true);
  };

  const handleDeleteDomain = (domain: Domain) => {
    setDeletingDomain(domain);
  };

  const handleSubmitDomain = async (data: Partial<Domain>) => {
    try {
      const url = editingDomain
        ? `/api/domains/${editingDomain.id}`
        : '/api/domains';

      const method = editingDomain ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh domains
        const domainsResponse = await fetch(`/api/domains?sort=${sortBy}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const domainsData = await domainsResponse.json();
        if (domainsData.success) {
          setDomains(domainsData.data);
        }

        setIsFormOpen(false);
        setEditingDomain(null);
      }
    } catch (error) {
      console.error('Failed to submit domain:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDomain) return;

    try {
      const response = await fetch(`/api/domains/${deletingDomain.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = await response.json();

      if (result.success) {
        setDomains(domains.filter(d => d.id !== deletingDomain.id));
        setDeletingDomain(null);
      }
    } catch (error) {
      console.error('Failed to delete domain:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header locale={locale} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Toolbar - 单行布局 */}
        <div className="mb-8 animate-slide-down">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* 搜索框 */}
            <div className="w-full lg:w-80">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* 筛选和排序 */}
            <div className="flex-1 w-full lg:w-auto">
              <FilterBar
                registrar={registrarFilter}
                filingStatus={filingStatusFilter}
                sortBy={sortBy}
                onRegistrarChange={setRegistrarFilter}
                onFilingStatusChange={setFilingStatusFilter}
                onSortChange={setSortBy}
                locale={locale}
              />
            </div>

            {/* 添加按钮 */}
            <Button variant="primary" onClick={handleAddDomain} size="md">
              <Plus className="w-4 h-4 mr-2" />
              {t('domain.addDomain')}
            </Button>
          </div>
        </div>

        {/* Domain List */}
        <DomainList
          domains={domains}
          onEdit={handleEditDomain}
          onDelete={handleDeleteDomain}
          locale={locale}
        />
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
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
          }}
          locale={locale}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingDomain}
        onClose={() => setDeletingDomain(null)}
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
            >
              {t('common.delete')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeletingDomain(null)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

