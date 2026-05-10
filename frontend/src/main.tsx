import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import {
  AnalyticsPage,
  DashboardPage,
  GeneratePage,
  HistoryPage,
  ImportPage,
  PreviewPage,
  QuestionsPage,
  SettingsPage,
  TemplatesPage,
} from "./pages/WorkspacePages";
import "./styles.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "questions", element: <QuestionsPage /> },
      { path: "import", element: <ImportPage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "generate", element: <GeneratePage /> },
      { path: "preview", element: <PreviewPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
