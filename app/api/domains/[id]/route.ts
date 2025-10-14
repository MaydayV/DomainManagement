import { NextRequest, NextResponse } from 'next/server';
import { getDomainById, updateDomain, deleteDomain } from '@/lib/domains';
import { getSessionFromHeader, validateSession } from '@/lib/auth';

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

// GET - 获取单个域名
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const domain = await getDomainById(params.id);

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: domain,
    });
  } catch (error) {
    console.error('Get domain error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch domain' },
      { status: 500 }
    );
  }
}

// PUT - 更新域名
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    
    // 确保所有字段都被正确处理
    const updateData = {
      name: body.name,
      registrar: body.registrar,
      expiryDate: body.expiryDate,
      registrationDate: body.registrationDate, // 🔧 确保编辑时也包含注册时间
      price: body.price,
      currency: body.currency,
      filingStatus: body.filingStatus,
      renewalUrl: body.renewalUrl,
      notes: body.notes,
    };

    const updatedDomain = await updateDomain(params.id, updateData);

    if (!updatedDomain) {
      return NextResponse.json(
        { success: false, error: 'Domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDomain,
    });
  } catch (error) {
    console.error('Update domain error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update domain' },
      { status: 500 }
    );
  }
}

// DELETE - 删除域名
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const success = await deleteDomain(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    });
  } catch (error) {
    console.error('Delete domain error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete domain' },
      { status: 500 }
    );
  }
}

