import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const clusters = await prisma.clusterNode.findMany();

    const updates = clusters.map((cluster) => {
      let newStatus = cluster.status;
      
      if (cluster.status === 'Pending Verification' || Math.random() > 0.8) {
        const isSpoofed = Math.random() < 0.1;
        newStatus = isSpoofed ? 'Spoofing Defended' : 'Thermodynamic Active';
      }

      return prisma.clusterNode.update({
        where: { id: cluster.id },
        data: {
          status: newStatus,
          verifiedAt: new Date(),
        },
      });
    });

    await prisma.$transaction(updates);

    const updatedClusters = await prisma.clusterNode.findMany();
    const metrics = await prisma.protocolMetrics.findUnique({ where: { id: 1 } });

    return NextResponse.json({ success: true, metrics: { ...metrics, activeClusters: updatedClusters } });
  } catch (error) {
    console.error('Error verifying nodes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
