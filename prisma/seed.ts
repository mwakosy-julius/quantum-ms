import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);

  // Users for login
  const admin = await prisma.user.upsert({
    where: { email: "admin@quantumrazer.com" },
    update: {},
    create: {
      email: "admin@quantumrazer.com",
      name: "Admin",
      password: hashed,
      role: "ADMIN",
    },
  });
  const staff = await prisma.user.upsert({
    where: { email: "staff@quantumrazer.com" },
    update: {},
    create: {
      email: "staff@quantumrazer.com",
      name: "Staff",
      password: hashed,
      role: "STAFF",
    },
  });
  const investorUser = await prisma.user.upsert({
    where: { email: "julius@quantumrazer.com" },
    update: {},
    create: {
      email: "julius@quantumrazer.com",
      name: "Julius",
      password: hashed,
      role: "INVESTOR",
    },
  });

  // Clear existing business data for fresh seed
  await prisma.dividend.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.user.updateMany({ data: { investorId: null } });
  await prisma.investor.deleteMany();
  await prisma.product.deleteMany();

  // Investors: Julius 5,000,000 TZS, Vaileth 2,000,000 TZS
  const julius = await prisma.investor.create({
    data: {
      name: "Julius",
      email: "julius@quantumrazer.com",
      phone: "",
      investmentAmount: 5_000_000,
      units: 5,
      profitSharePct: 71.43, // 5/7 of total
    },
  });
  const vaileth = await prisma.investor.create({
    data: {
      name: "Vaileth",
      email: "vaileth@quantumrazer.com",
      phone: "",
      investmentAmount: 2_000_000,
      units: 2,
      profitSharePct: 28.57, // 2/7 of total
    },
  });

  // Link investor user to Julius for demo
  await prisma.user.update({
    where: { id: investorUser.id },
    data: { investorId: julius.id },
  });

  // Products: 5 Bluetooth speakers (10k buy, 25k sell), 6 laptop stands (10k buy, 20k sell),
  // 5 flash drives (5k buy, 10k sell), 5 laptop bags (15k buy, 25k sell)
  const bluetoothSpeakers = await prisma.product.create({
    data: {
      name: "Bluetooth Speakers",
      category: "Accessories",
      supplier: "",
      purchasePrice: 10_000,
      sellingPrice: 25_000,
      stockQuantity: 5,
      minStockLevel: 2,
    },
  });
  const laptopStands = await prisma.product.create({
    data: {
      name: "Laptop Stands",
      category: "Accessories",
      supplier: "",
      purchasePrice: 10_000,
      sellingPrice: 20_000,
      stockQuantity: 6,
      minStockLevel: 2,
    },
  });
  const flashDrives = await prisma.product.create({
    data: {
      name: "Flash Drives",
      category: "Storage Devices",
      supplier: "",
      purchasePrice: 5_000,
      sellingPrice: 10_000,
      stockQuantity: 5,
      minStockLevel: 2,
    },
  });
  const laptopBags = await prisma.product.create({
    data: {
      name: "Laptop Bags",
      category: "Accessories",
      supplier: "",
      purchasePrice: 15_000,
      sellingPrice: 25_000,
      stockQuantity: 5,
      minStockLevel: 2,
    },
  });

  console.log("Seeded: Julius (5,000,000 TZS), Vaileth (2,000,000 TZS); 4 products in stock");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
