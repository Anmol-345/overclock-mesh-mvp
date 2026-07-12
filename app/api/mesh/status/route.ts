import { NextResponse } from 'next/server';

// In-memory mock state for Vercel deployment without a database
let globalMetrics = {
  id: 1,
  totalSlots: 500,
  filledSlots: 142, // Simulated active slots
  maxSlots: 500,
  circulatingOVL: 1250000,
  maxOVL: 7500000,
  activeClusters: [],
};

export async function GET() {
  try {
    return NextResponse.json(globalMetrics);
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
