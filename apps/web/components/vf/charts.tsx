"use client";

import { useTheme } from "@/components/theme-provider";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const THEME_COLORS = {
  dark: {
    text: "#EEEEE8",
    muted: "#52526a",
    grid: "#1e1e2c",
    tooltipBg: "#0d0d16",
    tooltipBorder: "#1e1e2c",
  },
  light: {
    text: "#373A41",
    muted: "#7E8490",
    grid: "#D8DBDF",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#D8DBDF",
  }
};

interface ChartProps {
  data: any[];
  height?: number;
  dataKey: string;
  categoryKey?: string;
}

export function BarChart({ data, height = 200, dataKey, categoryKey = "name" }: ChartProps) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.dark;
  const accent = theme === "light" ? "#A9D11C" : "#E8FF47";

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} />
          <Tooltip 
            cursor={{ fill: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder, borderRadius: '8px', color: colors.text, fontSize: '12px' }}
            itemStyle={{ color: accent, fontWeight: 'bold' }}
          />
          <Bar dataKey={dataKey} fill={accent} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({ data, height = 200, dataKey, categoryKey = "name" }: ChartProps) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.dark;
  const accent = theme === "light" ? "#A9D11C" : "#E8FF47";

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} />
          <Tooltip 
            contentStyle={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder, borderRadius: '8px', color: colors.text, fontSize: '12px' }}
            itemStyle={{ color: accent, fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={accent} strokeWidth={3} dot={{ fill: colors.tooltipBg, stroke: accent, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({ data, height = 200 }: { data: any[]; height?: number }) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.dark;
  
  const defaultColors = [
    theme === "light" ? "#A9D11C" : "#E8FF47",
    theme === "light" ? "#3b82f6" : "#6BAEEA",
    theme === "light" ? "#10b981" : "#1D9E75",
    theme === "light" ? "#f59e0b" : "#F2A623",
    theme === "light" ? "#ef4444" : "#E24B4A",
  ];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder, borderRadius: '8px', color: colors.text, fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value: any) => <span style={{ color: colors.text, fontSize: '12px', fontFamily: 'DM Sans' }}>{value}</span>}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
