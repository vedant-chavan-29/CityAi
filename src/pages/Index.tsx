import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import MetricCard from '@/components/MetricCard';
import { generate24HourData, predictEnergyDemand, calculateOptimization, formatMW } from '@/lib/energy';
import { Zap, Thermometer, DollarSign, Leaf, AlertTriangle, TrendingDown, Sun, Wind, Clock, Battery, MapPin } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useCities } from '@/hooks/useCities';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Dashboard() {
  const { profile } = useAuth();
  const { cities } = useCities();
  const selectedCity = cities.find(c => c.id === profile?.selected_city_id);
  
  const [hour, setHour] = useState(new Date().getHours());
  const [temperature, setTemperature] = useState(28);
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay());
  const [hourlyData, setHourlyData] = useState(generate24HourData);

  const prediction = useMemo(() => predictEnergyDemand({ hour, temperature, dayOfWeek }), [hour, temperature, dayOfWeek]);
  const optimization = useMemo(() => calculateOptimization(prediction.predictedDemand), [prediction.predictedDemand]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => setHourlyData(generate24HourData()), 10000);
    return () => clearInterval(interval);
  }, []);

  const iconMap: Record<string, React.ReactNode> = {
    clock: <Clock className="w-4 h-4" />,
    sun: <Sun className="w-4 h-4" />,
    battery: <Battery className="w-4 h-4" />,
    zap: <Zap className="w-4 h-4" />,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Energy Dashboard</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {selectedCity ? `${selectedCity.name} — AI-powered prediction` : 'Select a city in Profile to see local predictions'}
          </p>
        </div>
        {prediction.peakAlert && (
          <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1.5 text-sm animate-pulse-glow">
            <AlertTriangle className="w-4 h-4" /> Peak Load Alert
          </Badge>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Predicted Demand"
          value={formatMW(prediction.predictedDemand)}
          subtitle={`Confidence: ${prediction.confidence.toFixed(1)}%`}
          icon={<Zap className="w-5 h-5" />}
          variant={prediction.peakAlert ? 'danger' : 'primary'}
          trend={{ value: -3.2, label: 'vs yesterday' }}
        />
        <MetricCard
          title="Energy Saved"
          value={formatMW(optimization.energySaved)}
          subtitle="Through AI optimization"
          icon={<TrendingDown className="w-5 h-5" />}
          variant="accent"
          trend={{ value: 12, label: 'this week' }}
        />
        <MetricCard
          title="Cost Reduction"
          value={`$${optimization.costReduction.toLocaleString()}`}
          subtitle="Daily savings estimate"
          icon={<DollarSign className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          title="CO₂ Reduced"
          value={`${optimization.carbonReduction} t`}
          subtitle="Carbon emission savings"
          icon={<Leaf className="w-5 h-5" />}
          variant="accent"
          trend={{ value: 8, label: 'vs last month' }}
        />
      </div>

      {/* Controls + Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Prediction Controls */}
        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-5">AI Prediction Input</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Hour of Day</span>
                <span className="text-foreground font-mono font-semibold">{hour}:00</span>
              </div>
              <Slider value={[hour]} onValueChange={([v]) => setHour(v)} min={0} max={23} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Temperature</span>
                <span className="text-foreground font-mono font-semibold">{temperature}°C</span>
              </div>
              <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={-10} max={45} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Day of Week</span>
                <span className="text-foreground font-mono font-semibold">{dayNames[dayOfWeek]}</span>
              </div>
              <Slider value={[dayOfWeek]} onValueChange={([v]) => setDayOfWeek(v)} min={0} max={6} step={1} />
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Efficiency Score</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-primary">{optimization.efficiencyScore}%</span>
                <span className="text-xs text-energy-green mb-1">Excellent</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full energy-bar rounded-full transition-all duration-500" style={{ width: `${optimization.efficiencyScore}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* 24h Forecast Chart */}
        <Card className="lg:col-span-2 p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">24-Hour Energy Forecast</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(185, 80%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(185, 80%, 48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 70%, 45%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(152, 70%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(h) => `${h}:00`} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', fontSize: 12 }}
                labelFormatter={(h) => `${h}:00`}
              />
              <Area type="monotone" dataKey="demand" stroke="hsl(185, 80%, 48%)" fill="url(#demandGrad)" strokeWidth={2} name="Actual" />
              <Area type="monotone" dataKey="predicted" stroke="hsl(152, 70%, 45%)" fill="url(#predictGrad)" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Optimization Strategies + Energy Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI Optimization Strategies</h3>
          <div className="space-y-3">
            {optimization.strategies.map((s) => (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                <div className="p-2 rounded-md bg-primary/10 text-primary">{iconMap[s.icon]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                <span className="text-sm font-mono font-semibold text-primary">{s.impact} MW</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Energy Source Mix</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyData.filter((_, i) => i % 3 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(h) => `${h}h`} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="solar" stackId="a" fill="hsl(45, 90%, 55%)" name="Solar" radius={[0, 0, 0, 0]} />
              <Bar dataKey="wind" stackId="a" fill="hsl(210, 80%, 55%)" name="Wind" />
              <Bar dataKey="grid" stackId="a" fill="hsl(220, 18%, 30%)" name="Grid" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
