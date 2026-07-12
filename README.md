# ⚡ Overclock Mesh MVP

Overclock Mesh is a sovereign DePIN (Decentralized Physical Infrastructure Network) layer for fractional GPU/CPU cluster leasing, anchored to the Hacash L1 PoW security primitives.

This repository holds the **Minimum Viable Product (MVP)** frontend and mocked backend integration, built to showcase the core flow of `$GRID` Passport minting and `$OVL` reward distribution on a Web3 wallet.

## 🚀 Tech Stack

- **Framework:** Next.js 14+ (App Router), React 18, Turbopack
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Web3 / Blockchain:** RainbowKit v2, Wagmi v2, Viem (EVM-compatible architecture configured to Sepolia for testing)
- **Database / ORM:** Prisma v5 with SQLite (`dev.db`)
- **Language:** TypeScript strictly typed

## 🛠️ Local Development Setup

1. **Clone & Install Dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Database:**
   Generate the Prisma client and push the schema to the local SQLite database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *Navigate to `http://localhost:3000/dashboard` to view the application.*

## 🌐 Project Architecture

- **`app/dashboard/page.tsx`**: The main interface where users can allocate infrastructure lots, mint `$GRID` Passports via MetaMask, and view their simulated hardware node yield.
- **`app/providers.tsx`**: The Web3 configuration layer that wraps the app with RainbowKit and Wagmi. It routes transactions to the **Sepolia Testnet** (aliased as Hacash EVM for the demo).
- **`app/api/mesh/...`**: Serverless backend endpoints providing real-time data from the SQLite database.
- **`prisma/schema.prisma`**: The schema defining `ProtocolMetrics` and `ClusterNode` infrastructure tracking.

## ☁️ Vercel Deployment & Database Considerations

Yes, you **must** configure your Environment Variables in Vercel. 

### SQLite Limitations on Vercel
Currently, this MVP uses a local SQLite file (`dev.db`). While Vercel can host the Next.js frontend perfectly:
- Vercel's backend environment is **Serverless and Ephemeral**. 
- You can *read* from a local SQLite database if it's pushed to GitHub, but **any data written to it (like verifying new nodes) will be permanently lost** when the serverless function shuts down after a few seconds.

### Recommended Production Path
For persistent data on Vercel, you should migrate the database string from SQLite to a hosted Postgres provider (such as **Vercel Postgres, Supabase, or Neon**).

**If you still want to deploy the MVP as-is to Vercel for a quick visual demo:**
1. Go to your Vercel Project Settings -> Environment Variables.
2. Add the key `DATABASE_URL` with the exact value: `file:./dev.db`
3. Ensure you have pushed the `dev.db` file to GitHub (or create a seed script) so the build pipeline has access to the initial data state!
