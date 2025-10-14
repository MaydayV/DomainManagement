// 全局类型定义

declare global {
  var whoisCache: {
    [key: string]: {
      data: any;
      timestamp: number;
    };
  } | undefined;
}

export {};
