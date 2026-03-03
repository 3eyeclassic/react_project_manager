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
  name: string;
  value: number;
}

interface ClientRevenueChartProps {
  data: DataPoint[];
}

export function ClientRevenueChart({ data }: ClientRevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
        />
        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString()}円`, "売上"]}
        />
        <Bar
          dataKey="value"
          fill="hsl(var(--primary))"
          radius={[0, 4, 4, 0]}
          name="売上"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
