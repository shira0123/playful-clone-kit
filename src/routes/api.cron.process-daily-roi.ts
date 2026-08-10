import { createFileRoute } from '@tanstack/react-router';
import { processDailyRoi } from '../server/services/investment';
import { getRequestHeader } from '@tanstack/start-server-core/request-response';

export const Route = createFileRoute('/api/cron/process-daily-roi')({
  loader: async () => {
    const authHeader = getRequestHeader('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const result = await processDailyRoi();
      throw new Response(JSON.stringify({ success: true, ...result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error('Error processing daily ROI:', error);
      throw new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
});
