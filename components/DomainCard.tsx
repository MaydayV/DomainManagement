'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, ExternalLink, Settings, Edit, Trash2, Clock } from 'lucide-react';
import { Domain } from '@/types';
import { getDaysUntilExpiry, getExpiryStatus, cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currencies';
import { getRegistrarById, getRenewalUrl } from '@/lib/registrars';

interface DomainCardProps {
  domain: Domain;
  onEdit: (domain: Domain) => void;
  onDelete: (domain: Domain) => void;
  locale: string;
  isMenuOpen: boolean;
  onMenuToggle: (isOpen: boolean) => void;
}

export function DomainCard({ domain, onEdit, onDelete, locale, isMenuOpen, onMenuToggle }: DomainCardProps) {
  const t = useTranslations();
  const daysUntilExpiry = getDaysUntilExpiry(domain.expiryDate);
  const expiryStatus = getExpiryStatus(domain.expiryDate);
  const registrar = getRegistrarById(domain.registrar);
  const renewalUrl = getRenewalUrl(domain);

  const registrarName = registrar?.displayName[locale as 'zh' | 'en'] || domain.registrar;

  // 菜单自动关闭定时器
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isMenuOpen) {
      // 菜单打开时，设置3秒后自动关闭
      timer = setTimeout(() => {
        onMenuToggle(false);
      }, 3000);
    }
    
    // 清理定时器
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isMenuOpen, onMenuToggle]);

  const handleRenew = () => {
    window.open(renewalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDomainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`http://${domain.name}`, '_blank', 'noopener,noreferrer');
  };

  // 判断是否过期或即将过期
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  // 格式化日期为简短格式 2020/03/03
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
  };

  return (
    <div 
      className={cn(
        'relative bg-white rounded-xl border transition-all hover:shadow-2xl hover:-translate-y-1 group p-5 animate-slide-up',
        isExpired ? 'border-slate-300 bg-slate-50 opacity-60' : 'border-slate-200',
        isExpiringSoon && !isExpired && 'border-yellow-300 bg-yellow-50/30 shadow-sm',
        isMenuOpen && 'z-[50]' // 打开菜单时提升卡片层级
      )}
      style={{ animationDelay: '0.1s' }}
      onClick={() => {
        // 点击卡片其他区域关闭菜单
        if (isMenuOpen) {
          onMenuToggle(false);
        }
      }}
    >
      {/* 头部：域名、备案状态和注册商 */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 
            className="text-lg font-bold text-slate-900 cursor-pointer hover:text-primary-600 transition-colors truncate"
            onClick={handleDomainClick}
            title={`访问 ${domain.name}`}
          >
            {domain.name}
          </h3>
          {domain.filingStatus && (
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0',
              domain.filingStatus === 'filed' && 'bg-green-100 text-green-700',
              domain.filingStatus === 'filing' && 'bg-blue-100 text-blue-700',
              domain.filingStatus === 'not-filed' && 'bg-slate-100 text-slate-600'
            )}>
              {t(`filingStatus.${domain.filingStatus}`)}
            </span>
          )}
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 flex-shrink-0">
          {registrarName}
        </span>
      </div>

      {/* 时间信息区 */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 注册时间 */}
          {domain.registrationDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">{t('domain.registrationDate')}</span>
                <span className="font-medium text-slate-700">{formatShortDate(domain.registrationDate)}</span>
              </div>
            </div>
          )}
          
          {/* 到期时间 */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col flex-1">
              <span className="text-xs text-slate-400">{t('domain.expiryDate')}</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">{formatShortDate(domain.expiryDate)}</span>
                {daysUntilExpiry <= 30 && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
                    isExpired ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  )}>
                    {isExpired ? t('domain.expired') : `${daysUntilExpiry}${t('domain.days')}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息栏：价格 */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {domain.price > 0 && (
            <span className="text-sm text-slate-700">
              <span className="text-slate-500">{t('domain.renewalPrice')}:</span>
              <span className="font-semibold ml-1 text-slate-900">
                {formatPrice(domain.price, domain.currency)}
              </span>
            </span>
          )}
        </div>

        {/* 操作按钮组 */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRenew();
            }}
            className="inline-flex items-center justify-center w-8 h-8 text-primary-600 hover:bg-primary-50 rounded-lg transition-all hover:scale-110 active:scale-95"
            title={t('domain.renew')}
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(!isMenuOpen);
              }}
              className="inline-flex items-center justify-center w-8 h-8 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[100]" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuToggle(false);
                  }}
                  style={{ backgroundColor: 'transparent' }}
                />
                <div 
                  className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[200] animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 自动关闭提示 */}
                  <div className="absolute -top-8 right-0 flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>3s自动关闭</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(domain);
                      onMenuToggle(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(domain);
                      onMenuToggle(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('common.delete')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 备注 */}
      {domain.notes && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-600 line-clamp-2">{domain.notes}</p>
        </div>
      )}
    </div>
  );
}