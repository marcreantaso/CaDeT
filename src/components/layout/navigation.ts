import { Home, Route, Zap, Brain } from 'lucide-react';

export const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard', shortLabel: 'Home' },
  { path: '/journey', icon: Route, label: 'ACTOR Journey', shortLabel: 'Journey' },
  { path: '/skills', icon: Zap, label: 'Skills', shortLabel: 'Skills' },
  { path: '/insights', icon: Brain, label: 'Insights', shortLabel: 'Insights' },
];
