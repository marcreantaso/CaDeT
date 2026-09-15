import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/db";
export function CareerTrajectoryChart({
  mode = "readiness",
}: {
  mode?: "readiness" | "forecast";
}) {
  const { user } = useAuth();
  const [retry, setRetry] = useState(0);
  const result = useLiveQuery(async () => {
    if (!user)
      return {
        rows: [] as { date: string; values: Record<string, number> }[],
        error: "",
      };
    try {
      if (mode === "readiness") {
        const records = await db.progress_history
          .where("userId")
          .equals(user.id)
          .sortBy("date");
        return {
          rows: records
            .slice(-90)
            .map((row) => ({
              date: row.date,
              values: { Readiness: row.overall } as Record<string, number>,
            })),
          error: "",
        };
      }
      const records = await db.forecast_history
        .where("userId")
        .equals(user.id)
        .sortBy("date");
      const grouped = new Map<string, Record<string, number>>();
      for (const row of records) {
        const values = grouped.get(row.date) ?? Object.create(null);
        values[row.direction] = row.confidence;
        grouped.set(row.date, values);
      }
      return {
        rows: [...grouped]
          .slice(-90)
          .map(([date, values]) => ({ date, values })),
        error: "",
      };
    } catch {
      return { rows: [], error: "Could not load history." };
    }
  }, [user?.id, mode, retry]);
  const directions = [
    ...new Set(result?.rows.flatMap((row) => Object.keys(row.values)) ?? []),
  ];
  const colors = ["#a78bfa", "#2dd4bf", "#38bdf8", "#fbbf24", "#f472b6"];
  return (
    <section className="glass-card p-5">
      <h2 className="text-base mb-2">
        {mode === "readiness"
          ? "Readiness history"
          : "Career direction history"}
      </h2>
      <p
        className="text-sm mb-4"
        style={{ color: "hsl(var(--text-secondary))" }}
      >
        Daily snapshots (UTC), recorded while you use CaDeT. Showing up to 90
        days.
      </p>
      {!result ? (
        <p role="status">Loading history…</p>
      ) : result.error ? (
        <div>
          <p role="alert">{result.error}</p>
          <button
            className="btn btn-secondary"
            onClick={() => setRetry((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      ) : !result.rows.length ? (
        <div className="chart-empty">
          <p>No recorded history yet</p>
          <span>
            {mode === "readiness"
              ? "Your first saved career records establish your baseline."
              : "Saved career forecasts will appear here. No sample predictions are shown."}
          </span>
        </div>
      ) : (
        <>
          {result.rows.length === 1 && (
            <p className="text-sm mb-3">
              First snapshot recorded. Return on another day to see a trend.
            </p>
          )}
          <div className="chart-frame" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={result.rows}
                margin={{ left: 0, right: 15, top: 10, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis domain={[0, 100]} width={35} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--bg-secondary))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--text-primary))",
                  }}
                />
                <Legend />
                {directions.map((direction, index) => (
                  <Area
                    key={direction}
                    name={direction}
                    dataKey={(row) => row.values[direction]}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.12}
                    dot
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer">
              View history as a table
            </summary>
            <div className="history-table-wrap">
              <table>
                <caption className="sr-only">Saved daily history</caption>
                <thead>
                  <tr>
                    <th>Date (UTC)</th>
                    {directions.map((d) => (
                      <th key={d}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.date}>
                      <th>{row.date}</th>
                      {directions.map((d) => (
                        <td key={d}>
                          {row.values[d] === undefined
                            ? "—"
                            : `${row.values[d]}%`}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
