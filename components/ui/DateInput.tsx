'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DateInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  locale?: string;
}

export function DateInput({ label, value, onChange, error, required, placeholder, locale = 'zh' }: DateInputProps) {
  const t = useTranslations();
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 将 ISO 格式转换为显示格式 (YYYY-MM-DD)
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const formatted = date.toISOString().split('T')[0];
        setDisplayValue(formatted);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // 处理输入 - 支持快速输入 20250808
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^\d]/g, ''); // 只保留数字
    
    if (input.length === 8) {
      // 格式化为 YYYY-MM-DD
      const year = input.substring(0, 4);
      const month = input.substring(4, 6);
      const day = input.substring(6, 8);
      const formatted = `${year}-${month}-${day}`;
      
      // 验证日期有效性
      const date = new Date(formatted);
      if (!isNaN(date.getTime())) {
        setDisplayValue(formatted);
        onChange(date.toISOString());
        return;
      }
    }
    
    setDisplayValue(e.target.value);
  };

  // 处理粘贴 - 支持多种格式
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    
    // 尝试解析各种日期格式
    const patterns = [
      /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/,     // 2025年8月8日 或 2025-8-8
      /(\d{4})(\d{2})(\d{2})/,                         // 20250808
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,         // MM/DD/YYYY (美式)
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,       // DD/MM/YYYY (欧式)
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/,                 // January 15, 2025
    ];
    
    for (const pattern of patterns) {
      const match = pastedText.match(pattern);
      if (match) {
        let year, month, day;
        
        if (pattern === patterns[2]) {
          // MM/DD/YYYY 格式（美式）
          month = match[1].padStart(2, '0');
          day = match[2].padStart(2, '0');
          year = match[3];
        } else if (pattern === patterns[4]) {
          // January 15, 2025 格式
          const monthNames: Record<string, string> = {
            january: '01', february: '02', march: '03', april: '04',
            may: '05', june: '06', july: '07', august: '08',
            september: '09', october: '10', november: '11', december: '12'
          };
          month = monthNames[match[1].toLowerCase()] || '01';
          day = match[2].padStart(2, '0');
          year = match[3];
        } else {
          year = match[1];
          month = match[2].padStart(2, '0');
          day = match[3].padStart(2, '0');
        }
        
        const formatted = `${year}-${month}-${day}`;
        const date = new Date(formatted);
        
        if (!isNaN(date.getTime())) {
          setDisplayValue(formatted);
          onChange(date.toISOString());
          return;
        }
      }
    }
    
    // 如果无法解析，使用原始输入
    setDisplayValue(pastedText);
  };

  // 失去焦点时验证
  const handleBlur = () => {
    if (!displayValue) return;
    
    const date = new Date(displayValue);
    if (!isNaN(date.getTime())) {
      const formatted = date.toISOString().split('T')[0];
      setDisplayValue(formatted);
      onChange(date.toISOString());
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInput}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder={placeholder || (locale === 'en' ? 'YYYY-MM-DD or 20250808' : 'YYYY-MM-DD 或 20250808')}
        className={cn('input', error && 'border-red-500')}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-slate-400">
        {locale === 'en' 
          ? 'Supports: 2025-08-08, 20250808, 08/08/2025, January 15, 2025'
          : '支持：2025-08-08、20250808、08/08/2025、2025年8月8日'}
      </p>
    </div>
  );
}

