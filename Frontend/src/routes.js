import React, { lazy } from "react";

// Admin Imports (lazy-loaded for faster startup / code splitting)
const MainDashboard = lazy(() => import("views/admin/default"));
const ProspectsPage = lazy(() => import("views/admin/prospects"));
const ClientsPage = lazy(() => import("views/admin/clients"));
const ProjectsPage = lazy(() => import("views/admin/projects"));
const TasksPage = lazy(() => import("views/admin/tasks"));
const DocumentsPage = lazy(() => import("views/admin/documents"));
const PlanningPage = lazy(() => import("views/admin/planning"));

const UsersPage = lazy(() => import("views/admin/users"));

// Auth Imports
const SignIn = lazy(() => import("views/auth/SignIn"));
const SignUp = lazy(() => import("views/auth/SignUp"));

// Icon Imports
import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdArchitecture,
  MdAssignment,
  MdFolder,
  MdCalendarToday,
  MdManageAccounts,
  MdLock,
  MdPersonAdd,
  MdLogout,
} from "react-icons/md";

import { authService } from "services/api";

const allRoutes = [
  {
    name: "Tableau de Bord",
    layout: "/admin",
    path: "default",
    icon: <MdDashboard className="h-6 w-6" />,
    component: <MainDashboard />,
    roles: ["Administrator", "Architect", "Collaborator", "Secretary"],
  },
  {
    name: "Prospects",
    layout: "/admin",
    path: "prospects",
    icon: <MdPeople className="h-6 w-6" />,
    component: <ProspectsPage />,
    roles: ["Administrator", "Secretary"],
  },
  {
    name: "Clients",
    layout: "/admin",
    path: "clients",
    icon: <MdBusinessCenter className="h-6 w-6" />,
    component: <ClientsPage />,
    roles: ["Administrator", "Secretary", "Architect"],
  },
  {
    name: "Projects",
    layout: "/admin",
    path: "projects",
    icon: <MdArchitecture className="h-6 w-6" />,
    component: <ProjectsPage />,
    roles: ["Administrator", "Architect", "Collaborator"],
  },
  {
    name: "Tâches",
    layout: "/admin",
    path: "tasks",
    icon: <MdAssignment className="h-6 w-6" />,
    component: <TasksPage />,
    roles: ["Administrator", "Architect", "Collaborator"],
  },
  {
    name: "Documents",
    layout: "/admin",
    path: "documents",
    icon: <MdFolder className="h-6 w-6" />,
    component: <DocumentsPage />,
    roles: ["Administrator", "Architect", "Secretary"],
  },
  {
    name: "Planning",
    layout: "/admin",
    path: "planning",
    icon: <MdCalendarToday className="h-6 w-6" />,
    component: <PlanningPage />,
    roles: ["Administrator", "Architect", "Secretary"],
  },
  {
    name: "Utilisateurs & Rôles",
    layout: "/admin",
    path: "users",
    icon: <MdManageAccounts className="h-6 w-6" />,
    component: <UsersPage />,
    roles: ["Administrator"],
  },
  {
    name: "Déconnexion",
    layout: "/admin",
    path: "logout",
    icon: <MdLogout className="h-6 w-6" />,
    component: null,
    onClick: () => authService.logout(),
  },
  {
    name: "Connexion",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
    hideFromSidebar: true,
  },
  {
    name: "Créer un compte",
    layout: "/auth",
    path: "sign-up",
    icon: <MdPersonAdd className="h-6 w-6" />,
    component: <SignUp />,
    hideFromSidebar: true,
  },
];

export { allRoutes };
export default allRoutes;
