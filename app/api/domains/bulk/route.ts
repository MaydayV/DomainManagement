import { NextRequest, NextResponse } from 'next/server';
import { addDomainsBulk } from '@/lib/domains';
import { getSessionFromHeader, validateSession } from '@/lib/auth';
import { Domain } from '@/types';

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

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const items = Array.isArray(body?.domains) ? body.domains : [];

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No domains to import' },
        { status: 400 }
      );
    }

    const payload = items
      .filter((item: Partial<Domain>) => item?.name && item?.registrar && item?.expiryDate)
      .map((item: Partial<Domain>) => ({
        name: String(item.name).trim(),
        registrar: String(item.registrar),
        expiryDate: String(item.expiryDate),
        registrationDate: item.registrationDate,
        price: Number(item.price) || 0,
        currency: item.currency || 'CNY',
        filingStatus: item.filingStatus || '',
        renewalUrl: item.renewalUrl,
        notes: item.notes,
      }));

    const result = await addDomainsBulk(payload);

    return NextResponse.json({
      success: true,
      data: {
        added: result.added,
        skipped: result.skipped,
        addedCount: result.added.length,
        skippedCount: result.skipped.length,
      },
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import domains' },
      { status: 500 }
    );
  }
}
