import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processSyncJob } from '@/lib/sync/withings-sync'

export async function GET(req: NextRequest) {
  // Verificar secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Buscar jobs pendientes o en retry
  const pendingJobs = await prisma.syncJob.findMany({
    where: {
      OR: [
        { status: 'PENDING' },
        { 
          status: 'RETRYING',
          nextRetryAt: { lte: new Date() }
        }
      ]
    },
    take: 10, // Procesar en batches
    orderBy: { createdAt: 'asc' }
  })
  
  // Procesar en paralelo con límite de concurrencia
  const results = await Promise.allSettled(
    pendingJobs.map(job => processSyncJob(job.id))
  )
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  return Response.json({
    processed: pendingJobs.length,
    succeeded,
    failed,
    remaining: await prisma.syncJob.count({
      where: { status: { in: ['PENDING', 'RETRYING'] } }
    })
  })
}
