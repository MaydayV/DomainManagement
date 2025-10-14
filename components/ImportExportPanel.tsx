'use client';

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Domain } from '@/types';
import { exportToCSV, parseCSV, downloadCSV } from '@/lib/csv-export';
import { Button } from './ui/Button';

interface ImportExportPanelProps {
  domains: Domain[];
  onImport: (domains: Partial<Domain>[]) => void;
  locale: string;
}

export function ImportExportPanel({ domains, onImport, locale }: ImportExportPanelProps) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    if (domains.length === 0) {
      alert(t('message.noDataToExport'));
      return;
    }

    const csvContent = exportToCSV(domains, locale);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `domains-${timestamp}.csv`;
    
    downloadCSV(csvContent, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    
    try {
      const csvContent = await file.text();
      const importedDomains = parseCSV(csvContent);
      
      if (importedDomains.length === 0) {
        alert(t('message.invalidCSVFormat'));
        return;
      }

      const confirmed = confirm(
        t('message.importConfirm').replace('{count}', importedDomains.length.toString())
      );
      
      if (confirmed) {
        onImport(importedDomains);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(t('message.importFailed'));
    } finally {
      setImporting(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 导出按钮 */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        disabled={domains.length === 0}
        title={t('domain.exportCSV')}
      >
        <Download className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">{t('domain.export')}</span>
      </Button>

      {/* 导入按钮 */}
      <Button
        variant="secondary" 
        size="sm"
        onClick={handleImportClick}
        disabled={importing}
        title={t('domain.importCSV')}
      >
        <Upload className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">
          {importing ? t('common.loading') : t('domain.import')}
        </span>
      </Button>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* CSV 模板下载 */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          const template = locale === 'zh'
            ? '域名,注册商,注册时间,到期时间,续费价格,币种,备案状态,续费链接,备注\nexample.com,阿里云,2020-01-01,2025-12-31,80,CNY,已备案,https://...,测试域名'
            : 'Domain,Registrar,Registration Date,Expiry Date,Price,Currency,Filing Status,Renewal URL,Notes\nexample.com,Alibaba Cloud,2020-01-01,2025-12-31,80,CNY,filed,https://...,Test domain';
          downloadCSV(template, 'domains-template.csv');
        }}
        title={t('domain.downloadTemplate')}
      >
        <FileSpreadsheet className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">{t('domain.template')}</span>
      </Button>
    </div>
  );
}
