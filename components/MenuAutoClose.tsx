'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface MenuAutoCloseProps {
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // 秒数，默认3秒
}

export function MenuAutoClose({ isOpen, onClose, duration = 3 }: MenuAutoCloseProps) {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(duration);
      return;
    }

    // 倒计时
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 -mr-8 -mt-1">
      <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
        <Clock className="w-3 h-3" />
        <span>{countdown}s</span>
      </div>
    </div>
  );
}
