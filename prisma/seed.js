require('dotenv').config();
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const items = [
  // Main Canteen
  { name: "Veg Meals (Lunch)", price: 50, canteen: "Main Canteen", isAvailable: true },
  { name: "Chicken Biryani", price: 115, canteen: "Main Canteen", isAvailable: true },
  { name: "Veg Biryani", price: 80, canteen: "Main Canteen", isAvailable: true },
  { name: "Samosa (2 pcs)", price: 20, canteen: "Main Canteen", isAvailable: true },
  { name: "Egg Puffs", price: 15, canteen: "Main Canteen", isAvailable: true },
  { name: "Black Tea", price: 8, canteen: "Main Canteen", isAvailable: true },
  { name: "Milk Tea", price: 10, canteen: "Main Canteen", isAvailable: true },
  { name: "Coffee", price: 15, canteen: "Main Canteen", isAvailable: true },

  // Self-Finance Block Cafe
  { name: "Masala Dosa", price: 50, canteen: "Self-Finance Cafe", isAvailable: true },
  { name: "Ghee Roast", price: 40, canteen: "Self-Finance Cafe", isAvailable: true },
  { name: "Chicken Roll", price: 60, canteen: "Self-Finance Cafe", isAvailable: true },
  { name: "Veg Burger", price: 75, canteen: "Self-Finance Cafe", isAvailable: true },
  { name: "French Fries", price: 50, canteen: "Self-Finance Cafe", isAvailable: true },
  { name: "Fresh Lime Juice", price: 20, canteen: "Self-Finance Cafe", isAvailable: true },
  { name: "Cold Coffee", price: 40, canteen: "Self-Finance Cafe", isAvailable: true },

  // Co-operative Store Snack Bar
  { name: "Pazhampori (Banana Fritter)", price: 12, canteen: "Co-op Snack Bar", isAvailable: true },
  { name: "Parippuvada", price: 10, canteen: "Co-op Snack Bar", isAvailable: true },
  { name: "Neyyappam", price: 15, canteen: "Co-op Snack Bar", isAvailable: true },
  { name: "Bread Toast (Butter)", price: 25, canteen: "Co-op Snack Bar", isAvailable: true }
];

async function main() {
  console.log("Clearing existing menu items...");
  await prisma.menuItem.deleteMany({});
  
  console.log("Seeding menu items into SQLite...");
  for (const item of items) {
    await prisma.menuItem.create({
      data: item
    });
  }
  
  console.log(`Successfully seeded ${items.length} items.`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
