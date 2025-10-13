// 快速测试 KV 连接
require('dotenv').config({ path: '.env.local' });

async function testKV() {
  try {
    const { kv } = require('@vercel/kv');
    
    // 测试写入
    console.log('Testing KV write...');
    await kv.set('test', { message: 'hello', timestamp: new Date().toISOString() });
    
    // 测试读取
    console.log('Testing KV read...');
    const result = await kv.get('test');
    console.log('✅ KV test successful:', result);
    
    // 清理测试数据
    await kv.del('test');
    console.log('✅ KV connection working perfectly!');
    
  } catch (error) {
    console.error('❌ KV test failed:', error.message);
    console.log('Fallback: Will use file storage');
  }
}

testKV();
