import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let metrics = await prisma.protocolMetrics.findUnique({
      where: { id: 1 },
    });

    if (!metrics) {
      metrics = await prisma.protocolMetrics.create({
        data: {
          id: 1,
          totalSlots: 500,
          filledSlots: 0,
          maxSlots: 500,
          circulatingOVL: 0,
          maxOVL: 7500000,
        },
      });
    }

    const activeClusters = await prisma.clusterNode.findMany();

    return NextResponse.json({
      ...metrics,
      activeClusters,
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
