"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, AlertCircle, BarChart3 } from "lucide-react";
import { CalculationCard } from "@/components/calculation-card";
import { Button } from "@/components/ui/button";

interface VideoData {
  _id: string;
  title: string;
  createdAt: string;
  score?: number | { total?: number };
}

export function HistoryChart() {
  const [data, setData] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => { // used same fetch route here as in video-catalog.tsx
    setLoading(true);
    try {
      const response = await fetch("/api/videos", {
        headers: { "x-app-source": "shotvision-web" },
      });
      if (!response.ok) throw new Error("Failed to load history");
      
      const json = await response.json();
      const videos = json.videos || json; 
      setData(videos);
    } catch (err) {
      console.error(err);
      setError("Could not load history data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const chartData = useMemo(() => {
    if (!data.length) return [];

    return data
      .map((video) => {
        let scoreVal = 0;
        if (typeof video.score === "number") {
          scoreVal = video.score;
        } else if (typeof video.score === "object" && video.score?.total) {
          scoreVal = video.score.total;
        }

        if (!scoreVal) return null;

        return {
          id: video._id,
          name: video.title,
          date: new Date(video.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: new Date(video.createdAt).toLocaleDateString(),
          score: Math.round(scoreVal),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-10);
  }, [data]);

  // --- Custom Tooltip (Dark Theme) ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-600 bg-gray-900 p-3 shadow-xl">
          <p className="mb-1 text-xs font-medium text-gray-400">{payload[0].payload.fullDate}</p>
          <p className="text-sm font-semibold text-white">{payload[0].payload.name}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm font-bold text-blue-400">
              Score: {payload[0].value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <CalculationCard
      title="Swing History"
      description="Last 10 Analyzed Sessions"
      className="h-full min-h-[300px] bg-gray-800 text-white border-gray-700 shadow-none"
    >
      <div className="flex h-full flex-col">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-xs">Loading history...</span>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-red-400">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchHistory} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              Retry
            </Button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500">
            <BarChart3 className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No scored sessions yet.</p>
            <p className="text-xs">Upload a video to see your progress.</p>
          </div>
        ) : (
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#374151" // gray-700 for grid lines
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  // White text for axis labels
                  tick={{ fontSize: 10, fill: "#ffffff" }} 
                  dy={10}
                />
                <YAxis
                  hide={true} 
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: "#374151", opacity: 0.4 }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="score"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  fill="#3b82f6" // Default Blue Accent
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      // Logic: Blue for all, but maybe darker blue for lower scores if you want depth.
                      // Here keeping it strictly 'Blue Accents' as requested.
                      fill="#3b82f6" 
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Footer Summary - Styled for Dark Theme */}
        {!loading && chartData.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium text-gray-300">
                Average Score:{" "}
                <span className="text-white font-bold text-lg ml-1">
                  {Math.round(
                    chartData.reduce((acc, curr) => acc + curr.score, 0) /
                      chartData.length
                  )}
                </span>
              </span>
            </div>
            <div className="text-[10px] text-gray-500">
              Based on recent activity
            </div>
          </div>
        )}
      </div>
    </CalculationCard>
  );
}