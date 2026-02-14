import { Card } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'border-border',
  primary: 'border-primary/20 glow-primary',
  accent: 'border-accent/20 glow-accent',
  warning: 'border-energy-yellow/20',
  danger: 'border-destructive/20',
};

const iconBg = {
  default: 'bg-secondary text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-energy-yellow/10 text-energy-yellow',
  danger: 'bg-destructive/10 text-destructive',
};

export default function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <Card className={`p-5 gradient-card border ${variantStyles[variant]} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium ${trend.value >= 0 ? 'text-energy-green' : 'text-destructive'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg[variant]}`}>{icon}</div>
      </div>
    </Card>
  );
}
