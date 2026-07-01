import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWardenSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getWardenSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const warden = await prisma.warden.findUnique({
      where: { id: session.wardenId }
    });

    if (!warden || warden.role !== 'VENDOR_ADMIN' || !warden.vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { vendorId: warden.vendorId },
      include: {
        student: { select: { name: true, studentId: true } },
        items: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
