import { Router, Request, Response } from 'express';
import { createAIProvider } from '../services/ai.service';

export const aiRoutes = Router();
const aiProvider = createAIProvider();

// POST /api/ai/compress — Transform vague goals into measurable targets
aiRoutes.post('/compress', async (req: Request, res: Response) => {
  try {
    const { goals, preferences } = req.body;

    const prompt = `You are a career development advisor. Transform these vague career goals into specific, measurable career targets.

Goals: ${JSON.stringify(goals)}
Preferences: ${JSON.stringify(preferences)}

For each goal, create a compressed target with:
- A specific, measurable career target statement
- Role clarity score (0-100)
- Skill clarity score (0-100)
- Industry clarity score (0-100)
- Experience clarity score (0-100)
- Evidence clarity score (0-100)

Return as JSON array.`;

    const response = await aiProvider.generateCompletion(prompt, { goals, preferences });

    res.json({
      success: true,
      data: response.content,
      usage: response.usage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compress goals', message: (error as Error).message });
  }
});

// POST /api/ai/insights — Generate career insights from signals
aiRoutes.post('/insights', async (req: Request, res: Response) => {
  try {
    const { signals, experiments, skills, forecasts } = req.body;

    const prompt = `Analyze the following career development data and generate actionable insights.

Every insight MUST include:
1. A clear explanation of WHY this insight exists
2. What evidence supports it
3. What the user can do next

Career Signals: ${JSON.stringify(signals)}
Experiments: ${JSON.stringify(experiments)}
Skills: ${JSON.stringify(skills)}
Current Forecasts: ${JSON.stringify(forecasts)}

Generate insights that compare:
- What the user says they want vs what they actually do
- What they are capable of vs what they repeatedly engage with
- Positive vs negative reflections
- Career evidence produced

Return as JSON array of insights.`;

    const response = await aiProvider.generateCompletion(prompt, { signals, experiments, skills, forecasts });

    res.json({
      success: true,
      data: response.content,
      usage: response.usage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights', message: (error as Error).message });
  }
});

// POST /api/ai/forecast — Generate career trajectory forecasts
aiRoutes.post('/forecast', async (req: Request, res: Response) => {
  try {
    const { signals, events, skills, experiments, reflections } = req.body;

    const prompt = `Generate explainable career trajectory forecasts based on accumulated evidence.

CRITICAL RULES:
- Never present a forecast as a guaranteed prediction
- Use confidence percentages based on data strength
- Every forecast must explain WHY with positive signals, negative signals, behavioral evidence, skill evidence, experiment results, and missing evidence
- Treat results as hypotheses and recommendations

Data:
Signals: ${JSON.stringify(signals)}
Events: ${JSON.stringify(events)}
Skills: ${JSON.stringify(skills)}
Experiments: ${JSON.stringify(experiments)}
Reflections: ${JSON.stringify(reflections)}

Return forecasts as JSON with: direction, confidence, trend, positiveSignals, negativeSignals, behavioralEvidence, skillEvidence, experimentResults, missingEvidence, explanation.`;

    const response = await aiProvider.generateCompletion(prompt, { signals, events, skills, experiments, reflections });

    res.json({
      success: true,
      data: response.content,
      usage: response.usage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate forecast', message: (error as Error).message });
  }
});

// POST /api/ai/next-action — AI-recommended next best action
aiRoutes.post('/next-action', async (req: Request, res: Response) => {
  try {
    const { currentStage, targets, tasks, skills, experiments } = req.body;

    const prompt = `Recommend the single most impactful next action for this user's career development.

The recommendation MUST:
1. Be tied directly to a career objective (not a generic task)
2. Explain WHY this action matters
3. Include the expected impact
4. Reference specific evidence or gaps

Current ACTOR Stage: ${currentStage}
Career Targets: ${JSON.stringify(targets)}
Current Tasks: ${JSON.stringify(tasks)}
Skills: ${JSON.stringify(skills)}
Experiments: ${JSON.stringify(experiments)}

Return JSON with: title, reason, impact, effort, linkedStage, linkedTarget.`;

    const response = await aiProvider.generateCompletion(prompt, { currentStage, targets, tasks, skills, experiments });

    res.json({
      success: true,
      data: response.content,
      usage: response.usage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate next action', message: (error as Error).message });
  }
});
