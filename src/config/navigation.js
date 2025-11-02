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
  PieChart,
  ClipboardList,
  HelpCircle
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
    id: 'applications',
    label: 'Applications',
    icon: ClipboardList,
    description: 'Tenant applications',
    badge: 'NEW'
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
    description: '🤖 Predictive analytics & Optimization suggestions',
    badge: 'Coming Soon!',
    isDisabled: true
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    description: 'Get help with AdminEstate',
    badge: 'AI Assistant'
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
    items: ['dashboard', 'properties', 'tenants', 'applications']
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