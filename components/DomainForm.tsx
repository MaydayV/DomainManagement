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
import { isValidDomain, cn } from '@/lib/utils';

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
  const [whoisData, setWhoisData] = useState<any>(null);

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

    if (!formData.registrationDate) {
      newErrors.registrationDate = t('validation.required');
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = t('validation.required');
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

  // WHOIS 自动查询和填充功能
  const handleWhoisLookup = async () => {
    if (!formData.name) {
      return;
    }

    setWhoisLoading(true);
    setWhoisData(null);

    try {
      // 调用我们的 WHOIS API
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(formData.name)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        setWhoisData(data);

        // 自动填充表单
        const updates: any = {};
        
        // 设置注册商
        if (data.registrar) {
          updates.registrar = data.registrar;
          setShowCustomRegistrar(data.registrar === 'custom' || data.registrar.startsWith('custom-'));
          if (data.registrar.startsWith('custom-')) {
            setCustomRegistrarName(data.registrarName || data.registrar.substring(7));
          }
        }

        // 设置注册时间
        if (data.registrationDate) {
          updates.registrationDate = new Date(data.registrationDate).toISOString().split('T')[0];
        }

        // 设置到期时间
        if (data.expiryDate) {
          updates.expiryDate = new Date(data.expiryDate).toISOString().split('T')[0];
        }

        // 更新表单数据
        setFormData(prev => ({ ...prev, ...updates }));

        console.log('✅ WHOIS data auto-filled:', data);
      } else {
        console.error('WHOIS lookup failed:', result.error);
        alert(t('message.whoisFailed') || 'WHOIS 查询失败');
      }
    } catch (error) {
      console.error('WHOIS error:', error);
      alert(t('message.networkError'));
    } finally {
      setWhoisLoading(false);
    }
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
            disabled={!formData.name || whoisLoading}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              whoisLoading 
                ? "bg-yellow-50 text-yellow-600 border border-yellow-200" 
                : "text-primary-600 bg-primary-50 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title={whoisLoading ? t('domain.whoisQuerying') : t('domain.whoisAutoFill')}
          >
            {whoisLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                {t('common.loading')}
              </div>
            ) : (
              'WHOIS'
            )}
          </button>
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        <div className="mt-1 text-xs text-slate-500">
          <p>{t('domain.whoisAutoFillHint')}</p>
          {whoisLoading && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-blue-700 font-medium">🔍 {t('domain.whoisQuerying')}</p>
            </div>
          )}
          {whoisData && (
            <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-700 font-medium flex items-center gap-1">
                ✅ {t('domain.whoisSuccess')}
                <span className="text-xs bg-green-200 text-green-800 px-1 rounded">
                  {whoisData.source || 'whois'}
                </span>
              </p>
              <p className="text-green-600 text-xs">
                {t('domain.registrar')}: {whoisData.registrarName}
              </p>
              {whoisData.registrationDate && (
                <p className="text-green-600 text-xs">
                  {t('domain.registrationDate')}: {new Date(whoisData.registrationDate).toLocaleDateString(locale)}
                </p>
              )}
              {whoisData.expiryDate && (
                <p className="text-green-600 text-xs">
                  {t('domain.expiryDate')}: {new Date(whoisData.expiryDate).toLocaleDateString(locale)}
                </p>
              )}
              {whoisData.queryTime && (
                <p className="text-green-500 text-xs">
                  查询耗时: {whoisData.queryTime}s
                </p>
              )}
            </div>
          )}
        </div>
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
          error={errors.registrationDate}
          required
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
          required
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

