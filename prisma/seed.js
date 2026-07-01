/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let prisma;
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl?.startsWith('postgresql://') || databaseUrl?.startsWith('postgres://')) {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else if (databaseUrl?.startsWith('file:')) {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  console.log('Generating password hash...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  console.log('Flushing database...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.authenticator.deleteMany({});
  await prisma.mealRedemption.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.warden.deleteMany({});

  console.log('Seeding database with demo students...');

  // 1. Create Paid Student
  await prisma.student.upsert({
    where: { studentId: 10001 },
    update: {},
    create: {
      studentId: 10001,
      name: 'Elena Rodriguez (Paid)',
      paidStatus: 1, // Cleared
      passwordHash: passwordHash
    }
  });

  // 2. Create Unpaid Student
  await prisma.student.upsert({
    where: { studentId: 10002 },
    update: {},
    create: {
      studentId: 10002,
      name: 'Marcus Chen (Unpaid)',
      paidStatus: 0, // Suspended
      passwordHash: passwordHash
    }
  });

  // 3. Create Unregistered Demo Student
  await prisma.student.upsert({
    where: { studentId: 10003 },
    update: {},
    create: {
      studentId: 10003,
      name: 'Aisha Patel (New)',
      paidStatus: 1, // Cleared
      passwordHash: null
    }
  });

  console.log('Seeding vendors and menu items...');
  const mainCanteen = await prisma.vendor.create({
    data: {
      name: 'Main Canteen',
      menuItems: {
        create: [
          { name: 'Chicken Biryani', price: 120 },
          { name: 'Paneer Butter Masala', price: 100 },
          { name: 'Veg Thali', price: 80 }
        ]
      }
    }
  });

  const farmCakes = await prisma.vendor.create({
    data: {
      name: 'Farm Cakes',
      menuItems: {
        create: [
          { name: 'Chocolate Truffle Pastry', price: 60 },
          { name: 'Vanilla Cupcake', price: 40 },
          { name: 'Cheese Croissant', price: 50 }
        ]
      }
    }
  });

  const cafe = await prisma.vendor.create({
    data: {
      name: 'Cafe',
      menuItems: {
        create: [
          { name: 'Cold Coffee', price: 70 },
          { name: 'Grilled Sandwich', price: 90 },
          { name: 'French Fries', price: 50 }
        ]
      }
    }
  });
  console.log('Vendors and Menu Items seeded successfully.');

  console.log('Seeding Admins...');

  const admins = [
    { username: 'hostel_warden_1', name: 'Hostel Warden 1', role: 'HOSTEL_WARDEN', vendorId: null },
    { username: 'hostel_warden_2', name: 'Hostel Warden 2', role: 'HOSTEL_WARDEN', vendorId: null },
    { username: 'canteen_admin_1', name: 'Canteen Admin 1', role: 'VENDOR_ADMIN', vendorId: mainCanteen.id },
    { username: 'canteen_admin_2', name: 'Canteen Admin 2', role: 'VENDOR_ADMIN', vendorId: mainCanteen.id },
    { username: 'farmcakes_admin_1', name: 'Farm Cakes Admin 1', role: 'VENDOR_ADMIN', vendorId: farmCakes.id },
    { username: 'farmcakes_admin_2', name: 'Farm Cakes Admin 2', role: 'VENDOR_ADMIN', vendorId: farmCakes.id },
    { username: 'cafe_admin_1', name: 'Cafe Admin 1', role: 'VENDOR_ADMIN', vendorId: cafe.id },
    { username: 'cafe_admin_2', name: 'Cafe Admin 2', role: 'VENDOR_ADMIN', vendorId: cafe.id },
  ];

  for (const admin of admins) {
    await prisma.warden.create({
      data: {
        username: admin.username,
        name: admin.name,
        role: admin.role,
        vendorId: admin.vendorId,
        passwordHash: passwordHash
      }
    });
  }

  console.log('Seeding completed successfully:');
  console.log(' - Students: 10001, 10002, 10003');
  console.log(' - Admins: hostel_warden_1, canteen_admin_1, farmcakes_admin_1, cafe_admin_1');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
