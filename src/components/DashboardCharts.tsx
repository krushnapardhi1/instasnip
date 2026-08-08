'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface ChartDataItem {
  date: string;
  success: number;
  failed: number;
}

interface DashboardChartsProps {
  data: ChartDataItem[];
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  // Defer rendering until client-side hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 w-full bg-zinc-950/20 rounded-xl flex items-center justify-center border border-zinc-900/60">
        <span className="text-zinc-500 text-xs animate-pulse">Initializing analytics view...</span>
      </div>
    );
  }

  // Custom tooltip design
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border-zinc-700 bg-zinc-950/95 p-3 rounded-lg shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-zinc-300">{payload[0].payload.date}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Success: {payload[0].value}
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Failed: {payload[1].value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full pr-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={8}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="success"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSuccess)"
          />
          <Area
            type="monotone"
            dataKey="failed"
            stroke="#f43f5e"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorFailed)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
