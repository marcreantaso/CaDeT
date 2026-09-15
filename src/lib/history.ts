import { db } from "./db";
import type { CareerReadiness, CareerForecast } from "../types/career";
export async function saveDailyProgress(
  userId: string,
  score: CareerReadiness,
  date = new Date().toISOString().slice(0, 10),
) {
  if (!userId) throw new Error("Workspace unavailable.");
  const signature = JSON.stringify(score);
  await db.transaction("rw", db.progress_history, async () => {
    const id = `${userId}:${date}`;
    const previous = await db.progress_history.get(id);
    if (previous?.signature !== signature)
      await db.progress_history.put({ id, userId, date, ...score, signature });
  });
}
export async function saveDailyForecasts(
  userId: string,
  forecasts: CareerForecast[],
  date = new Date().toISOString().slice(0, 10),
) {
  const latest = new Map<string, CareerForecast>();
  for (const forecast of forecasts) {
    if (forecast.userId !== userId) continue;
    const previous = latest.get(forecast.direction);
    if (!previous || forecast.updatedAt > previous.updatedAt)
      latest.set(forecast.direction, forecast);
  }
  await db.forecast_history.bulkPut(
    [...latest.values()].map((f) => ({
      id: `${userId}:${date}:${f.direction}`,
      userId,
      date,
      direction: f.direction,
      confidence: f.confidence,
    })),
  );
}
