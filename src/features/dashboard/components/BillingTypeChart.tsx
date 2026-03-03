import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BillingTypeChartProps {
  fixed: number;
  hourly: number;
}

export function BillingTypeChart({ fixed, hourly }: BillingTypeChartProps) {
  const data = [
    { name: "一式", value: fixed },
    { name: "時間単価", value: hourly },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          <Cell fill="hsl(var(--primary))" />
          <Cell fill="hsl(var(--chart-2))" />
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString()}円`, "売上"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
