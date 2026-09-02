// API 重试和错误处理工具

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 带重试的 API 调用
export async function apiWithRetry<T>(
  url: string,
  options: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<ApiResponse<T>> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 5000,
    timeout = 30000
  } = retryOptions;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        return { success: false, error: 'Unauthorized' };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        return result;
      }

    } catch (error: any) {
      lastError = error;

      if (!isNetworkError(error)) {
        break;
      }

      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return {
    success: false,
    error: formatErrorMessage(lastError),
  };
}

// 判断是否为网络相关错误
function isNetworkError(error: any): boolean {
  const networkErrorMessages = [
    'fetch',
    'network',
    'timeout',
    'abort',
    'connection',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND'
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  return networkErrorMessages.some(msg => errorMessage.includes(msg));
}

// 格式化错误信息
function formatErrorMessage(error: any): string {
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return 'Request timeout, but data might be saved. Please refresh to check.';
  }

  if (isNetworkError(error)) {
    return 'Network issue detected. Data may be saved successfully. Please refresh to verify.';
  }

  return error.message || 'Unknown error occurred';
}

// 乐观更新助手
export function withOptimisticUpdate<T>(
  optimisticData: T,
  apiCall: () => Promise<ApiResponse<T>>,
  onSuccess: (data: T) => void,
  onError: (error: string, shouldRevert: boolean) => void
) {
  // 立即应用乐观更新
  onSuccess(optimisticData);

  // 后台执行真实 API 调用
  apiCall()
    .then(result => {
      if (result.success) {
        // API 成功，更新为真实数据
        if (result.data) {
          onSuccess(result.data);
        }
      } else {
        // API 失败，决定是否回滚
        const shouldRevert = !isNetworkError(new Error(result.error || ''));
        onError(result.error || 'Unknown error', shouldRevert);
      }
    })
    .catch(error => {
      // 网络错误，通常不回滚（数据可能已保存）
      const shouldRevert = !isNetworkError(error);
      onError(error.message, shouldRevert);
    });
}
