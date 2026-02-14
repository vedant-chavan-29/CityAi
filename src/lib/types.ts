export interface EnergyReading {
  hour: number;
  demand: number;
  predicted: number;
  temperature: number;
  solar: number;
  wind: number;
  grid: number;
}

export interface PredictionInput {
  hour: number;
  temperature: number;
  dayOfWeek: number;
}

export interface PredictionResult {
  predictedDemand: number;
  confidence: number;
  peakAlert: boolean;
  recommendations: string[];
}

export interface OptimizationResult {
  energySaved: number;
  costReduction: number;
  carbonReduction: number;
  efficiencyScore: number;
  strategies: OptimizationStrategy[];
}

export interface OptimizationStrategy {
  name: string;
  icon: string;
  impact: number;
  description: string;
  status: 'active' | 'suggested' | 'scheduled';
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number;
  modelAccuracy: number;
  uptime: number;
  lastTrained: string;
}

export interface DailyStats {
  date: string;
  totalDemand: number;
  peakDemand: number;
  avgTemperature: number;
  renewableShare: number;
  savings: number;
}
