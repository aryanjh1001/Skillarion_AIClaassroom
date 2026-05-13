import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartProps = {
  title1: string;
  title2: string;
  data?: { name: string; value: number }[];
};

const defaultData = [
  { name: "Mon", value: 75 },
  { name: "Tue", value: 82 },
  { name: "Wed", value: 70 },
  { name: "Thu", value: 88 },
  { name: "Fri", value: 92 },
];

export default function Charts({ title1, title2, data }: ChartProps) {
  const chartData = data && data.length > 0 ? data : defaultData;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const axisColor = isDark ? "#F8FAFC" : "#1E293B";
  const gridColor = isDark ? "#94A3B8" : "#64748B";
  const tooltipBg = isDark ? "#0D1526" : "#FFFFFF";
  const tooltipText = isDark ? "#FFFFFF" : "#0F172A";

  return (
    <div className="text-slate-900 dark:text-white">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-hover rounded-2xl border border-slate-200/40 bg-white/80 p-4 dark:border-blue-500/10 dark:bg-[#111B44]/50">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {title1}
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

              <XAxis
                dataKey="name"
                tick={{ fill: axisColor, fontSize: 13, fontWeight: 700 }}
                axisLine={{ stroke: axisColor }}
                tickLine={{ stroke: axisColor }}
              />

              <YAxis
                tick={{ fill: axisColor, fontSize: 13, fontWeight: 700 }}
                axisLine={{ stroke: axisColor }}
                tickLine={{ stroke: axisColor }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  color: tooltipText,
                  border: `1px solid ${gridColor}`,
                  borderRadius: "12px",
                }}
                labelStyle={{ color: tooltipText }}
              />

              <Bar dataKey="value" fill="#C8952E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-hover rounded-2xl border border-slate-200/40 bg-white/80 p-4 dark:border-blue-500/10 dark:bg-[#111B44]/50">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {title2}
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

              <XAxis
                dataKey="name"
                tick={{ fill: axisColor, fontSize: 13, fontWeight: 700 }}
                axisLine={{ stroke: axisColor }}
                tickLine={{ stroke: axisColor }}
              />

              <YAxis
                tick={{ fill: axisColor, fontSize: 13, fontWeight: 700 }}
                axisLine={{ stroke: axisColor }}
                tickLine={{ stroke: axisColor }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  color: tooltipText,
                  border: `1px solid ${gridColor}`,
                  borderRadius: "12px",
                }}
                labelStyle={{ color: tooltipText }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke={isDark ? "#60A5FA" : "#0F3460"}
                strokeWidth={4}
                dot={{
                  fill: isDark ? "#3B82F6" : "#C8952E",
                  r: 5,
                  strokeWidth: 2,
                  stroke: isDark ? "#60A5FA" : "#0F3460",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}