'use client';

import React from 'react';
import { Wifi, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wifi className="w-10 h-10 text-slate-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          离线模式 | Offline Mode
        </h1>
        
        <p className="text-slate-600 mb-6">
          当前网络连接不可用，您正在查看缓存的内容。
        </p>
        
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新连接
        </button>
      </div>
    </div>
  );
}
