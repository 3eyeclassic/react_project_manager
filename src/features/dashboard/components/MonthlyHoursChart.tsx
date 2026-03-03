import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  hours: number;
}

interface MonthlyHoursChartProps {
  data: DataPoint[];
}

export function MonthlyHoursChart({ data }: MonthlyHoursChartProps) {
  const displayData = data.map((d) => ({
    ...d,
    monthLabel: d.month.replace(/-/, "/"),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={displayData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="monthLabel"
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          tickFormatter={(v) => `${v}h`}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}時間`, "稼働"]}
          labelFormatter={(label) => label}
        />
        <Bar
          dataKey="hours"
          fill="hsl(var(--chart-3))"
          radius={[4, 4, 0, 0]}
          name="稼働時間"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
