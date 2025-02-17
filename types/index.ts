export interface BaseResponse {
  success: boolean;
  error?: string;
}

export interface Budget {
  id: string;
  department: string;
  amount: number;
  year: number;
  quarter?: number;
  month?: number;
  lastUpdated: string;
  changePercentage?: number;
}

export interface BudgetDistribution {
  total: number;
  departments: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  period: {
    year: number;
    quarter?: number;
    month?: number;
  };
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  amount: number;
  department: string;
  status: 'draft' | 'published' | 'in_progress' | 'awarded' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  publishedAt: string;
  updatedAt: string;
  awardedAt?: string;
  completedAt?: string;
  documents: ContractDocument[];
}

export interface ContractDocument {
  id: string;
  type: 'specifications' | 'technical_report' | 'budget' | 'contract' | 'amendment' | 'other';
  title: string;
  url: string;
  uploadedAt: string;
  size: number;
  format: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  date: string;
  priority: number;
  read: boolean;
  category: 'budget' | 'contract' | 'system' | 'legal';
  link?: string;
}

export interface EducationData {
  totalDatasets: number;
  institutions: number;
  lastUpdate: string;
  stats: {
    publicSchools: number;
    privateSchools: number;
    universities: number;
    vocationalCenters: number;
    studentTeacherRatio: number;
    graduationRate: number;
    dropoutRate: number;
    investmentPerStudent: number;
    digitalAdoption: number;
    internationalPrograms: number;
  };
  trends: {
    enrollmentChange: number;
    budgetChange: number;
    performanceIndex: number;
    employabilityRate: number;
  };
  qualityMetrics: {
    averageClassSize: number;
    teacherQualification: number;
    infrastructureScore: number;
    studentSatisfaction: number;
  };
}

export interface HealthData {
  totalDatasets: number;
  facilities: number;
  lastUpdate: string;
  stats: {
    hospitals: number;
    healthCenters: number;
    specialists: number;
    emergencyUnits: number;
  };
}

export interface MobilityData {
  totalDatasets: number;
  routes: number;
  lastUpdate: string;
  stats: {
    busLines: number;
    metroLines: number;
    trainLines: number;
    bikeStations: number;
  };
}

export interface EnvironmentData {
  totalDatasets: number;
  stations: number;
  lastUpdate: string;
  stats: {
    airQualityStations: number;
    waterQualityStations: number;
    protectedAreas: number;
    recyclingCenters: number;
  };
}