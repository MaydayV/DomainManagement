import { NextRequest, NextResponse } from 'next/server';
import { getDomains, addDomain, filterAndSortDomains } from '@/lib/domains';
import { getSessionFromHeader, validateSession } from '@/lib/auth';
import { FilterOptions, SortOption } from '@/types';

// 认证中间件
function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const session = getSessionFromHeader(authHeader);

  if (!validateSession(session)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null;
}

// GET - 获取所有域名
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    
    // 获取筛选和排序参数
    const filters: FilterOptions = {
      registrar: searchParams.get('registrar') || undefined,
      filingStatus: searchParams.get('filingStatus') as any || undefined,
      searchQuery: searchParams.get('search') || undefined,
    };
    
    const sort = (searchParams.get('sort') as SortOption) || 'expiry-asc';

    const domains = await getDomains();
    const filteredDomains = filterAndSortDomains(domains, filters, sort);

    return NextResponse.json({
      success: true,
      data: filteredDomains,
    });
  } catch (error) {
    console.error('Get domains error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}

// POST - 添加新域名
export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.registrar || !body.expiryDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newDomain = await addDomain({
      name: body.name,
      registrar: body.registrar,
      expiryDate: body.expiryDate,
      price: body.price || 0,
      currency: body.currency || 'CNY',
      filingStatus: body.filingStatus || '',
      renewalUrl: body.renewalUrl,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: newDomain,
    });
  } catch (error) {
    console.error('Add domain error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add domain' },
      { status: 500 }
    );
  }
}

