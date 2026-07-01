'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getVendors() {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    });
    return { success: true, data: vendors };
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return { success: false, error: 'Failed to fetch vendors' };
  }
}

export async function getMenuItems(vendorId: number) {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { vendorId, isAvailable: true },
      orderBy: { id: 'asc' }
    });
    return { success: true, data: menuItems };
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return { success: false, error: 'Failed to fetch menu items' };
  }
}

export async function placeOrder(
  studentId: number,
  vendorId: number,
  items: { menuItemId: number; quantity: number; price: number }[]
) {
  try {
    // Basic validation
    if (!studentId || !vendorId || !items.length) {
      return { success: false, error: 'Invalid order data' };
    }

    // Generate a unique order number (e.g., #CAFE-XXXX)
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return { success: false, error: 'Vendor not found' };

    const prefix = vendor.name.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `#${prefix}-${randomNum}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create the order using a transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        studentId,
        vendorId,
        totalAmount,
        status: 'Pending',
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtTimeOfOrder: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        vendor: true
      }
    });

    revalidatePath('/'); // Revalidate the page to clear any cached data
    return { success: true, data: order };
  } catch (error) {
    console.error('Failed to place order:', error);
    return { success: false, error: 'Failed to place order' };
  }
}
