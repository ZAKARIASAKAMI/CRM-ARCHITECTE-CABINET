import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import ProspectsPage from "views/admin/prospects";
import ClientsPage from "views/admin/clients";
import ProjectsPage from "views/admin/projects";
import TasksPage from "views/admin/tasks";
import DocumentsPage from "views/admin/documents";
import PlanningPage from "views/admin/planning";

import UsersPage from "views/admin/users";

// Auth Imports
import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";

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

const routes = [
  {
    name: "Tableau de Bord",
    layout: "/admin",
    path: "default",
    icon: <MdDashboard className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Prospects",
    layout: "/admin",
    path: "prospects",
    icon: <MdPeople className="h-6 w-6" />,
    component: <ProspectsPage />,
  },
  {
    name: "Clients",
    layout: "/admin",
    path: "clients",
    icon: <MdBusinessCenter className="h-6 w-6" />,
    component: <ClientsPage />,
  },
  {
    name: "Projets",
    layout: "/admin",
    path: "projects",
    icon: <MdArchitecture className="h-6 w-6" />,
    component: <ProjectsPage />,
  },
  {
    name: "Tâches",
    layout: "/admin",
    path: "tasks",
    icon: <MdAssignment className="h-6 w-6" />,
    component: <TasksPage />,
  },
  {
    name: "Documents",
    layout: "/admin",
    path: "documents",
    icon: <MdFolder className="h-6 w-6" />,
    component: <DocumentsPage />,
  },
  {
    name: "Planning",
    layout: "/admin",
    path: "planning",
    icon: <MdCalendarToday className="h-6 w-6" />,
    component: <PlanningPage />,
  },
  {
    name: "Utilisateurs & Rôles",
    layout: "/admin",
    path: "users",
    icon: <MdManageAccounts className="h-6 w-6" />,
    component: <UsersPage />,
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

export default routes;
