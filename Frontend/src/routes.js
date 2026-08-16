import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import ProspectsPage from "views/admin/prospects";
import ClientsPage from "views/admin/clients";
import ProjectsPage from "views/admin/projects";
import TasksPage from "views/admin/tasks";
import DocumentsPage from "views/admin/documents";
import PlanningPage from "views/admin/planning";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdArchitecture,
  MdAssignment,
  MdFolder,
  MdCalendarToday,
  MdLock,
} from "react-icons/md";

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
    name: "Connexion",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
  },
];

export default routes;
