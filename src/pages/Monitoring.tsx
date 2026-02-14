import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MetricCard from '@/components/MetricCard';
import { generate24HourData, formatMW } from '@/lib/energy';
import type { EnergyReading } from '@/lib/types';
import { Activity, Zap, Sun, Wind, Gauge } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function Monitoring() {
  const [data, setData] = useState<EnergyReading[]>(generate24HourData);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generate24HourData());
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = data[new Date().getHours()] || data[12];
  const peakDemand = Math.max(...data.map((d) => d.demand));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Real-Time Monitoring</h1>
          <p className="text-sm text-muted-foreground">Live smart meter data simulation</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1.5 border-energy-green/30 text-energy-green">
          <span className="w-2 h-2 rounded-full bg-energy-green animate-pulse-glow" />
          Live — Update #{tick}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Current Demand" value={formatMW(current.demand)} icon={<Zap className="w-5 h-5" />} variant="primary" />
        <MetricCard title="Solar Output" value={formatMW(current.solar)} icon={<Sun className="w-5 h-5" />} variant="accent" />
        <MetricCard title="Wind Output" value={formatMW(current.wind)} icon={<Wind className="w-5 h-5" />} variant="default" />
        <MetricCard title="Peak Today" value={formatMW(peakDemand)} icon={<Gauge className="w-5 h-5" />} variant={peakDemand > 450 ? 'danger' : 'warning'} />
      </div>

      <Card className="p-5 gradient-card border-border animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground mb-4">Live Demand Curve</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
            <XAxis dataKey="hour" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(h) => `${h}:00`} />
            <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', fontSize: 12 }} />
            <Line type="monotone" dataKey="demand" stroke="hsl(185, 80%, 48%)" strokeWidth={2.5} dot={false} name="Demand" />
            <Line type="monotone" dataKey="predicted" stroke="hsl(152, 70%, 45%)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
            <Line type="monotone" dataKey="solar" stroke="hsl(45, 90%, 55%)" strokeWidth={1.5} dot={false} name="Solar" />
            <Line type="monotone" dataKey="wind" stroke="hsl(210, 80%, 55%)" strokeWidth={1.5} dot={false} name="Wind" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Live meters grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {data.filter((_, i) => i % 2 === 0).map((reading) => (
          <Card key={reading.hour} className="p-3 gradient-card border-border text-center">
            <p className="text-[10px] text-muted-foreground font-mono">{reading.hour}:00</p>
            <p className={`text-lg font-bold font-mono ${reading.demand > 400 ? 'text-destructive' : reading.demand > 350 ? 'text-energy-yellow' : 'text-primary'}`}>
              {reading.demand}
            </p>
            <p className="text-[10px] text-muted-foreground">MW</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
