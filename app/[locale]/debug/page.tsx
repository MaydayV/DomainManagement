'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function DebugPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      setHealthData({ success: false, error: 'Failed to check health' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          🔍 系统诊断 / System Diagnosis
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">KV 数据库健康检查</h2>
          
          <button
            onClick={checkHealth}
            disabled={loading}
            className="mb-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '检查中...' : '重新检查'}
          </button>

          {healthData && (
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${healthData.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <h3 className={`font-medium ${healthData.success ? 'text-green-800' : 'text-red-800'}`}>
                  {healthData.success ? '✅ KV 数据库正常' : '❌ KV 数据库异常'}
                </h3>
                {healthData.data && (
                  <pre className="mt-2 text-sm text-slate-600 overflow-auto">
                    {JSON.stringify(healthData.data, null, 2)}
                  </pre>
                )}
              </div>

              {healthData.error && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="font-medium text-yellow-800">错误信息</h3>
                  <p className="text-sm text-yellow-700 mt-1">{healthData.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">解决方案</h2>
          
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h3 className="font-medium text-slate-900">如果 KV 配置异常：</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>检查 Vercel Dashboard → Storage → KV 数据库是否存在</li>
                <li>确认 KV 数据库已连接到当前项目</li>
                <li>检查环境变量：KV_REST_API_URL, KV_REST_API_TOKEN</li>
                <li>重新部署项目</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-slate-900">如果仍然出现 HTTP 500：</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>这说明数据实际已保存到 KV，但文件写入失败</li>
                <li>刷新页面查看数据是否存在</li>
                <li>避免重复点击保存按钮</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
