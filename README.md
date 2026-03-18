# Quantum Razer Investment & Inventory Management System

A minimalistic web-based management platform for tracking investor capital, inventory purchases, product sales, profit generation, and dividend distribution.

## Features

- **Dashboard** – Financial overview, inventory alerts, sales metrics, investor summary
- **Investors** – Add/manage investors, track capital, units, profit share %, dividends paid
- **Inventory** – Products with categories, stock levels, purchase/selling prices
- **Sales** – Record transactions, automatic stock deduction
- **Dividends** – Distribute profits to investors (60% investors / 40% business)
- **Reports** – Financial summary, investor dividend report, inventory report
- **Role-based access** – Admin, Staff, Investor roles

## Tech Stack

- Next.js 16 (App Router)
- Prisma + SQLite (swap to PostgreSQL for production)
- NextAuth (credentials)
- Tailwind CSS v4
- Lucide icons

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` (see `.env.example`):
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. Initialize database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Run dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and sign in.

## Demo Accounts

| Role     | Email                     | Password   |
|----------|---------------------------|------------|
| Admin    | admin@quantumrazer.com     | admin123   |
| Staff    | staff@quantumrazer.com     | admin123   |
| Investor | investor@quantumrazer.com  | admin123   |

## Theme

Midnight green (`#004e64`) and metallic silver (`#a8a9ad`) – minimalistic dark interface.
