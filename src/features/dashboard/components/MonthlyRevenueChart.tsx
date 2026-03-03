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
  revenue: number;
}

interface MonthlyRevenueChartProps {
  data: DataPoint[];
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const displayData = data.map((d) => ({
    ...d,
    monthLabel: d.month.replace(/-/, "/"),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
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
          tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString()}円`, "売上"]}
          labelFormatter={(label) => label}
        />
        <Bar
          dataKey="revenue"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          name="売上"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
