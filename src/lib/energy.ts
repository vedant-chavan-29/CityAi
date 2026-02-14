import type { EnergyReading, PredictionInput, PredictionResult, OptimizationResult, DailyStats, SystemHealth } from './types';

// Simulated ML prediction using polynomial regression approximation
export function predictEnergyDemand(input: PredictionInput): PredictionResult {
  const { hour, temperature, dayOfWeek } = input;
  
  // Base demand curve (MW) - peaks at 9am and 6pm
  const hourFactor = 300 + 150 * Math.sin((hour - 6) * Math.PI / 12) + 80 * Math.sin((hour - 14) * Math.PI / 6);
  
  // Temperature factor - high cooling/heating needs
  const tempFactor = Math.abs(temperature - 22) * 8;
  
  // Weekend reduction
  const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1.0;
  
  // Random noise
  const noise = (Math.random() - 0.5) * 30;
  
  const predictedDemand = Math.max(150, (hourFactor + tempFactor) * weekendFactor + noise);
  const peakThreshold = 450;
  
  const recommendations: string[] = [];
  if (predictedDemand > peakThreshold) {
    recommendations.push('Shift non-critical loads to off-peak hours');
    recommendations.push('Activate battery storage systems');
    recommendations.push('Increase renewable energy dispatch');
  } else if (predictedDemand > peakThreshold * 0.8) {
    recommendations.push('Pre-cool buildings before peak period');
    recommendations.push('Monitor renewable energy availability');
  } else {
    recommendations.push('Charge energy storage systems');
    recommendations.push('Schedule maintenance tasks');
  }

  return {
    predictedDemand: Math.round(predictedDemand * 10) / 10,
    confidence: 85 + Math.random() * 12,
    peakAlert: predictedDemand > peakThreshold,
    recommendations,
  };
}

export function calculateOptimization(demand: number): OptimizationResult {
  const baselineDemand = demand * 1.15;
  const energySaved = baselineDemand - demand;
  const costPerMW = 45;
  const carbonPerMW = 0.42;

  return {
    energySaved: Math.round(energySaved * 10) / 10,
    costReduction: Math.round(energySaved * costPerMW),
    carbonReduction: Math.round(energySaved * carbonPerMW * 100) / 100,
    efficiencyScore: Math.min(98, Math.round(72 + Math.random() * 20)),
    strategies: [
      { name: 'Load Shifting', icon: 'clock', impact: 35, description: 'Defer 35 MW to off-peak window', status: 'active' },
      { name: 'Solar Dispatch', icon: 'sun', impact: 28, description: 'Route 28 MW from solar farms', status: 'active' },
      { name: 'Battery Storage', icon: 'battery', impact: 18, description: 'Discharge 18 MW from grid batteries', status: 'suggested' },
      { name: 'Demand Response', icon: 'zap', impact: 12, description: 'Reduce HVAC load across 120 buildings', status: 'scheduled' },
    ],
  };
}

export function generate24HourData(): EnergyReading[] {
  return Array.from({ length: 24 }, (_, hour) => {
    const base = 300 + 150 * Math.sin((hour - 6) * Math.PI / 12);
    const demand = Math.max(180, base + (Math.random() - 0.5) * 60);
    const predicted = demand + (Math.random() - 0.5) * 25;
    const solar = hour >= 6 && hour <= 18 ? Math.sin((hour - 6) * Math.PI / 12) * 120 * (0.8 + Math.random() * 0.4) : 0;
    const wind = 20 + Math.random() * 60;
    return {
      hour,
      demand: Math.round(demand),
      predicted: Math.round(predicted),
      temperature: Math.round(18 + 8 * Math.sin((hour - 4) * Math.PI / 14) + (Math.random() - 0.5) * 3),
      solar: Math.round(solar),
      wind: Math.round(wind),
      grid: Math.round(Math.max(0, demand - solar - wind)),
    };
  });
}

export function generateWeeklyStats(): DailyStats[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((date) => ({
    date,
    totalDemand: Math.round(5000 + Math.random() * 2000),
    peakDemand: Math.round(400 + Math.random() * 150),
    avgTemperature: Math.round(20 + Math.random() * 10),
    renewableShare: Math.round(25 + Math.random() * 30),
    savings: Math.round(200 + Math.random() * 400),
  }));
}

export function getSystemHealth(): SystemHealth {
  return {
    cpuUsage: Math.round(25 + Math.random() * 40),
    memoryUsage: Math.round(40 + Math.random() * 30),
    apiLatency: Math.round(12 + Math.random() * 25),
    modelAccuracy: Math.round(88 + Math.random() * 9),
    uptime: 99.95 + Math.random() * 0.04,
    lastTrained: '2026-02-12 14:30',
  };
}

export function formatMW(value: number): string {
  return `${value.toLocaleString()} MW`;
}

export function getStatusColor(value: number, thresholds: [number, number]): string {
  if (value < thresholds[0]) return 'text-energy-green';
  if (value < thresholds[1]) return 'text-energy-yellow';
  return 'text-energy-red';
}
