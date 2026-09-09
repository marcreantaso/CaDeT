// Application constants

export const APP_NAME = 'CaDeT';
export const APP_SUBTITLE = 'Career Development Tracker';
export const APP_TAGLINE = 'Build the career you can prove.';

// Design tokens
export const COLORS = {
  // Dashboard (dark)
  bgPrimary: 'hsl(222, 47%, 6%)',
  bgSecondary: 'hsl(222, 35%, 10%)',
  bgTertiary: 'hsl(222, 30%, 14%)',
  border: 'hsl(222, 25%, 16%)',
  borderHover: 'hsl(222, 25%, 22%)',
  textPrimary: 'hsl(210, 40%, 96%)',
  textSecondary: 'hsl(215, 20%, 65%)',
  textMuted: 'hsl(215, 15%, 45%)',

  // Accent
  accent: 'hsl(262, 83%, 58%)',
  accentLight: 'hsl(262, 83%, 68%)',
  accentDark: 'hsl(262, 83%, 45%)',
  accentGlow: 'hsla(262, 83%, 58%, 0.3)',

  // Secondary
  teal: 'hsl(172, 66%, 50%)',
  tealGlow: 'hsla(172, 66%, 50%, 0.2)',

  // Semantic
  success: 'hsl(150, 70%, 45%)',
  warning: 'hsl(45, 93%, 55%)',
  error: 'hsl(0, 72%, 51%)',
  info: 'hsl(200, 83%, 55%)',

  // Auth (light)
  authBg: 'hsl(210, 40%, 98%)',
  authSurface: 'hsl(0, 0%, 100%)',
  authText: 'hsl(222, 47%, 11%)',
  authTextSecondary: 'hsl(215, 16%, 47%)',
} as const;

// ACTOR stage colors (already in actor.ts meta but convenient here)
export const ACTOR_COLORS = {
  aim: 'hsl(262, 83%, 58%)',
  compress: 'hsl(200, 83%, 55%)',
  test: 'hsl(45, 93%, 55%)',
  own: 'hsl(150, 70%, 45%)',
  run: 'hsl(340, 80%, 55%)',
} as const;

// Navigation items
export const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/', icon: 'Home' },
  { id: 'journey', label: 'Journey', path: '/journey', icon: 'Route' },
  { id: 'add', label: 'Add', path: '#add', icon: 'Plus' },
  { id: 'skills', label: 'Skills', path: '/skills', icon: 'Zap' },
  { id: 'insights', label: 'Insights', path: '/insights', icon: 'Brain' },
] as const;

// Quick add items
export const QUICK_ADD_ITEMS = [
  { id: 'goal', label: 'Goal', icon: 'Target', color: ACTOR_COLORS.aim },
  { id: 'skill', label: 'Skill', icon: 'Zap', color: ACTOR_COLORS.compress },
  { id: 'project', label: 'Project', icon: 'FolderKanban', color: ACTOR_COLORS.test },
  { id: 'experiment', label: 'Experiment', icon: 'FlaskConical', color: ACTOR_COLORS.test },
  { id: 'achievement', label: 'Achievement', icon: 'Trophy', color: ACTOR_COLORS.own },
  { id: 'reflection', label: 'Reflection', icon: 'BookOpen', color: ACTOR_COLORS.run },
  { id: 'experience', label: 'Experience', icon: 'Briefcase', color: ACTOR_COLORS.run },
] as const;

// Career direction presets
export const CAREER_DIRECTIONS = [
  'Software Engineering',
  'AI Engineering',
  'Data Engineering',
  'Cybersecurity',
  'Product Engineering',
  'DevOps Engineering',
  'Frontend Engineering',
  'Backend Engineering',
  'Full-Stack Development',
  'Machine Learning',
  'Cloud Architecture',
  'UX Engineering',
] as const;
