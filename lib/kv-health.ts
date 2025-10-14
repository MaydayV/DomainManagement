// KV 健康检查和诊断工具

export async function checkKVHealth() {
  try {
    const { kv } = require('@vercel/kv');
    
    console.log('🔍 KV Health Check...');
    
    // 环境变量检查
    const config = {
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      KV_URL: !!process.env.KV_URL,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };
    
    console.log('📊 Environment Variables:', config);
    
    // 连接测试
    const testKey = `health_check_${Date.now()}`;
    const testValue = { timestamp: new Date().toISOString() };
    
    // 写入测试
    await kv.set(testKey, testValue);
    console.log('✅ KV Write test passed');
    
    // 读取测试
    const retrieved = await kv.get(testKey);
    console.log('✅ KV Read test passed:', retrieved);
    
    // 删除测试
    await kv.del(testKey);
    console.log('✅ KV Delete test passed');
    
    return {
      success: true,
      config,
      message: 'KV is working properly'
    };
    
  } catch (error: any) {
    console.error('❌ KV Health Check Failed:', error);
    return {
      success: false,
      error: error?.message || 'Unknown error',
      config: {
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        KV_URL: !!process.env.KV_URL,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
      }
    };
  }
}
