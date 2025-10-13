// 域名接口
export interface Domain {
  id: string;
  name: string; // 域名
  registrar: string; // 注册商 ID
  expiryDate: string; // 到期时间 (ISO 8601)
  registrationDate?: string; // 注册时间 (ISO 8601)
  price: number; // 价格
  currency: string; // 币种 (CNY, USD, EUR, etc.)
  filingStatus: FilingStatus; // 备案状态
  renewalUrl?: string; // 自定义续费链接
  notes?: string; // 备注
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 备案状态
export type FilingStatus = 'filed' | 'not-filed' | 'filing' | '';

// 注册商接口
export interface Registrar {
  id: string;
  name: string; // 唯一标识
  displayName: {
    zh: string;
    en: string;
  };
  logo?: string; // Logo URL
  renewalUrlTemplate?: string; // 续费链接模板
  website: string;
  isCustom?: boolean; // 是否为自定义注册商
}

// 币种选项
export interface CurrencyOption {
  code: string;
  symbol: string;
  name: {
    zh: string;
    en: string;
  };
}

// 排序选项
export type SortOption = 'expiry-asc' | 'expiry-desc' | 'name-asc' | 'name-desc' | 'created-asc' | 'created-desc';

// 筛选条件
export interface FilterOptions {
  registrar?: string;
  filingStatus?: FilingStatus;
  searchQuery?: string;
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 登录请求
export interface LoginRequest {
  password: string;
}

// 会话信息
export interface SessionInfo {
  authenticated: boolean;
  expiresAt?: number;
}

