import { Home, Route, Zap, Brain, FolderKanban } from "lucide-react";

export const navigationItems = [
  { path: "/", icon: Home, label: "Dashboard", shortLabel: "Home" },
  {
    path: "/journey",
    icon: Route,
    label: "ACTOR Journey",
    shortLabel: "Journey",
  },
  { path: "/skills", icon: Zap, label: "Skills", shortLabel: "Skills" },
  {
    path: "/records",
    icon: FolderKanban,
    label: "Records",
    shortLabel: "Records",
  },
  { path: "/insights", icon: Brain, label: "Insights", shortLabel: "Insights" },
];
