'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Domain, FilingStatus } from '@/types';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { DateInput } from './ui/DateInput';
import { DEFAULT_REGISTRARS } from '@/lib/registrars';
import { CURRENCIES } from '@/lib/currencies';
import { isValidDomain } from '@/lib/utils';

interface DomainFormProps {
  domain?: Domain | null;
  onSubmit: (data: Partial<Domain>) => void;
  onCancel: () => void;
  locale: string;
}

export function DomainForm({ domain, onSubmit, onCancel, locale }: DomainFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    registrar: 'aliyun',
    expiryDate: '',
    registrationDate: '',
    price: '',
    currency: 'CNY',
    filingStatus: '' as FilingStatus,
    renewalUrl: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [showCustomRegistrar, setShowCustomRegistrar] = useState(false);
  const [customRegistrarName, setCustomRegistrarName] = useState('');

  useEffect(() => {
    if (domain) {
      // 检查是否为自定义注册商
      const isCustom = domain.registrar.startsWith('custom-');
      const registrarValue = isCustom ? 'custom' : domain.registrar;
      const customName = isCustom ? domain.registrar.substring(7) : '';
      
      setFormData({
        name: domain.name,
        registrar: registrarValue,
        expiryDate: domain.expiryDate.split('T')[0],
        registrationDate: domain.registrationDate?.split('T')[0] || '',
        price: domain.price.toString(),
        currency: domain.currency,
        filingStatus: domain.filingStatus,
        renewalUrl: domain.renewalUrl || '',
        notes: domain.notes || '',
      });
      
      setShowCustomRegistrar(isCustom);
      setCustomRegistrarName(customName);
    }
  }, [domain]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    } else if (!isValidDomain(formData.name)) {
      newErrors.name = t('validation.invalidDomain');
    }

    if (!formData.registrar) {
      newErrors.registrar = t('validation.required');
    }

    if (formData.registrar === 'custom' && !customRegistrarName.trim()) {
      newErrors.registrar = t('registrar.customRequired');
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = t('validation.required');
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = t('validation.invalidPrice');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registrarValue = formData.registrar === 'custom' && customRegistrarName.trim() 
        ? `custom-${customRegistrarName.trim()}` 
        : formData.registrar;

      const submitData: Partial<Domain> = {
        name: formData.name.trim(),
        registrar: registrarValue,
        expiryDate: new Date(formData.expiryDate).toISOString(),
        registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString() : undefined,
        price: Number(formData.price) || 0,
        currency: formData.currency,
        filingStatus: formData.filingStatus,
        renewalUrl: formData.renewalUrl.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrarOptions = [
    ...DEFAULT_REGISTRARS.map(r => ({
      value: r.id,
      label: r.displayName[locale as 'zh' | 'en'],
    })),
    {
      value: 'custom',
      label: t('registrar.custom'),
    }
  ];

  const currencyOptions = CURRENCIES.map(c => ({
    value: c.code,
    label: `${c.symbol} ${c.name[locale as 'zh' | 'en']}`,
  }));

  const filingStatusOptions = [
    { value: '', label: t('filingStatus.empty') },
    { value: 'filed', label: t('filingStatus.filed') },
    { value: 'not-filed', label: t('filingStatus.notFiled') },
    { value: 'filing', label: t('filingStatus.filing') },
  ];

  // WHOIS 查询辅助功能
  const handleWhoisLookup = () => {
    if (!formData.name) {
      return;
    }
    // 打开 WHOIS 查询页面供用户参考
    window.open(`https://mwhois.chinaz.com/${formData.name}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 域名输入和 WHOIS 查询 */}
      <div>
        <label className="label">{t('domain.domainName')}</label>
        <div className="flex gap-2">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="example.com"
            error={errors.name}
            required
            className="flex-1"
          />
          <button
            type="button"
            onClick={handleWhoisLookup}
            disabled={!formData.name}
            className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            title={t('domain.whoisLookup')}
          >
            WHOIS
          </button>
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        <p className="mt-1 text-xs text-slate-500">{t('domain.whoisHint')}</p>
      </div>

      <div>
        <Select
          label={t('domain.registrar')}
          value={formData.registrar}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({ ...formData, registrar: value });
            setShowCustomRegistrar(value === 'custom');
            if (value !== 'custom') {
              setCustomRegistrarName('');
            }
          }}
          options={registrarOptions}
          error={errors.registrar}
          required
        />
        
        {/* 自定义注册商输入 */}
        {showCustomRegistrar && (
          <div className="mt-3">
            <Input
              label={t('registrar.customName')}
              value={customRegistrarName}
              onChange={(e) => setCustomRegistrarName(e.target.value)}
              placeholder={t('registrar.customPlaceholder')}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              {t('registrar.customHint')}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          label={t('domain.registrationDate')}
          value={formData.registrationDate ? new Date(formData.registrationDate).toISOString() : ''}
          onChange={(value) => setFormData({ ...formData, registrationDate: value.split('T')[0] })}
          locale={locale}
        />

        <DateInput
          label={t('domain.expiryDate')}
          value={formData.expiryDate ? new Date(formData.expiryDate).toISOString() : ''}
          onChange={(value) => setFormData({ ...formData, expiryDate: value.split('T')[0] })}
          error={errors.expiryDate}
          required
          locale={locale}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('domain.renewalPrice')}
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="0.00"
          error={errors.price}
        />

        <Select
          label={t('domain.currency')}
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          options={currencyOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t('domain.filingStatus')}
          value={formData.filingStatus}
          onChange={(e) => setFormData({ ...formData, filingStatus: e.target.value as FilingStatus })}
          options={filingStatusOptions}
        />

        <Input
          label={t('domain.customRenewalUrl')}
          value={formData.renewalUrl}
          onChange={(e) => setFormData({ ...formData, renewalUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="label">{t('domain.notes')}</label>
        <textarea
          className="input min-h-[80px] resize-y"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={t('domain.notes')}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          variant="primary" 
          className="flex-1" 
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.loading') : t('common.save')}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}

