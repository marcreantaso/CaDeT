import { Router, Request, Response } from 'express';

export const careerRoutes = Router();

// GET /api/career/trajectory — Fetch trajectory data for visualization
careerRoutes.get('/trajectory', async (req: Request, res: Response) => {
  try {
    // In production, query career_signals and actor_events grouped by time period
    // For now, return mock trajectory shape
    res.json({
      success: true,
      data: {
        message: 'Trajectory endpoint ready. Connect to Supabase for live data.',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trajectory', message: (error as Error).message });
  }
});

// POST /api/career/signal — Record a career signal
careerRoutes.post('/signal', async (req: Request, res: Response) => {
  try {
    const { signalType, direction, strength, description, sourceEvent } = req.body;

    // Validate required fields
    if (!signalType || !direction || strength === undefined) {
      return res.status(400).json({ error: 'Missing required fields: signalType, direction, strength' });
    }

    // In production, insert into career_signals table via Supabase service role
    res.json({
      success: true,
      data: {
        id: `sig-${Date.now()}`,
        signalType,
        direction,
        strength,
        description,
        sourceEvent,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record signal', message: (error as Error).message });
  }
});
