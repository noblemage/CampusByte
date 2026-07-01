import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWardenSession } from '@/lib/auth';

export async function POST(request: Request) {
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

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Ensure the order belongs to this vendor
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.vendorId !== warden.vendorId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
