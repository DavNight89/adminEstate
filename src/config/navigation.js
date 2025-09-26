import { 
  Home, 
  Building, 
  Users, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Wrench, 
  MessageSquare,
  Zap,
  PieChart
} from 'lucide-react';

export const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    description: 'Overview & quick actions' 
  },
  { 
    id: 'properties', 
    label: 'Properties', 
    icon: Building, // ✅ Better icon than Home 
    description: 'Manage your portfolio' 
  },
  { 
    id: 'tenants', 
    label: 'Tenants', 
    icon: Users, 
    description: 'Tenant information' 
  },
  { 
    id: 'workorders', 
    label: 'Work Orders', 
    icon: Wrench, 
    description: 'Maintenance requests' 
  },
  { 
    id: 'financial', 
    label: 'Financial', 
    icon: DollarSign, 
    description: 'Income & expenses' 
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: BarChart3, 
    description: 'Occupancy insights' 
  },
  { 
    id: 'ai-insights', 
    label: 'AI Insights', 
    icon: Zap, 
    description: '🤖 Intelligent automation',
    badge: 'NEW' // ✅ Add badges for new features
  },
  { 
    id: 'communication', 
    label: 'Messages', 
    icon: MessageSquare, 
    description: 'Tenant communication' 
  },
  { 
    id: 'documents', 
    label: 'Documents', 
    icon: FileText, 
    description: 'File management' 
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: PieChart, // ✅ Different icon to distinguish from analytics
    description: 'Analytics & insights' 
  }
];

// Optional: Group navigation items
export const navigationGroups = [
  {
    label: 'Core',
    items: ['dashboard', 'properties', 'tenants']
  },
  {
    label: 'Operations', 
    items: ['workorders', 'financial', 'communication']
  },
  {
    label: 'Intelligence',
    items: ['analytics', 'ai-insights', 'reports', 'documents']
  }
];