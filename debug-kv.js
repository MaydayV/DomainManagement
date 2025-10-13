// KV 连接调试脚本
console.log('=== KV Debug ===');
console.log('KV_URL:', process.env.KV_URL ? 'SET' : 'NOT SET');
console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'SET' : 'NOT SET');
console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'SET' : 'NOT SET');
console.log('VERCEL:', process.env.VERCEL);

const testKV = async () => {
  try {
    const { kv } = require('@vercel/kv');
    console.log('\n🧪 Testing KV connection...');
    
    // 测试写入
    await kv.set('debug-test', { message: 'hello', time: new Date() });
    console.log('✅ Write successful');
    
    // 测试读取
    const result = await kv.get('debug-test');
    console.log('✅ Read successful:', result);
    
    // 清理
    await kv.del('debug-test');
    console.log('✅ KV working perfectly!');
    
  } catch (error) {
    console.error('❌ KV Error:', error.message);
  }
};

testKV();
