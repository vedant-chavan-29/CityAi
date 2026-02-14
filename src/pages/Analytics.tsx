import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { generateWeeklyStats, generate24HourData } from '@/lib/energy';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['hsl(45, 90%, 55%)', 'hsl(210, 80%, 55%)', 'hsl(152, 70%, 45%)', 'hsl(220, 18%, 35%)'];

export default function Analytics() {
  const weeklyStats = useMemo(generateWeeklyStats, []);
  const hourlyData = useMemo(generate24HourData, []);

  const energyMix = [
    { name: 'Solar', value: 32 },
    { name: 'Wind', value: 24 },
    { name: 'Hydro', value: 12 },
    { name: 'Grid', value: 32 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Historical trends and energy performance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Demand Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', fontSize: 12 }} />
              <Line type="monotone" dataKey="totalDemand" stroke="hsl(185, 80%, 48%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(185, 80%, 48%)' }} name="Total Demand (MW)" />
              <Line type="monotone" dataKey="peakDemand" stroke="hsl(0, 72%, 55%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(0, 72%, 55%)' }} name="Peak Demand (MW)" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Renewable Energy Mix</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={energyMix} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {energyMix.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Savings (USD)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="savings" fill="hsl(152, 70%, 45%)" radius={[6, 6, 0, 0]} name="Savings ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Temperature vs Demand Correlation</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 90%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(25, 90%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(h) => `${h}h`} />
              <YAxis yAxisId="left" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', fontSize: 12 }} />
              <Area yAxisId="left" type="monotone" dataKey="demand" stroke="hsl(185, 80%, 48%)" fill="url(#demandGrad)" strokeWidth={2} name="Demand (MW)" />
              <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="hsl(25, 90%, 55%)" strokeWidth={2} dot={false} name="Temp (°C)" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
