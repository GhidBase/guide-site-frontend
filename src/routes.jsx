import { useAuth } from "./hooks/useAuth.js";
import { createBrowserRouter, RouterProvider } from "react-router";
import Checklist from "./components/Checklist";
import Main from "./components/Main";
import PageManager from "./components/PageManager";
import PageBuilder from "./components/PageBuilder";
import EditorExample from "./components/TextEditor";
import oldRoutes from "./js/oldRoutes.jsx";
import NotFound from "./components/NotFound.jsx";
import GuardianCosts from "./components/mini-apps/GuardianCosts.jsx";
import ImmortalGuardians from "./components/mini-apps/ImmortalGuardians.jsx";
import LoginPage from "./components/pages/LoginPage.jsx";
import SignupPage from "./components/pages/SignupPage.jsx";
import DashboardContent from "./components/pages/Dashboard.jsx";
import AccessDeniedPage from "./components/pages/AccessDeniedPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export function AppRouter() {
    const { user, loading } = useAuth();

    if (loading) return;

    const routes = [
        ...oldRoutes,
        {
            path: "*",
            element: <Main />,
            children: [
                ...(user?.role === "ADMIN"
                    ? [
                          {
                              path: "page-manager/",
                              element: (
                                  <ProtectedRoute requiredRole="ADMIN">
                                      <PageManager />
                                  </ProtectedRoute>
                              ),
                          },
                      ]
                    : []),
                {
                    path: "dashboard/",
                    element: (
                        <ProtectedRoute requiredRole="EDITOR">
                            <DashboardContent />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "access-denied/",
                    element: <AccessDeniedPage />,
                },
                { path: "login", element: <LoginPage /> },
                { path: "signup", element: <SignupPage /> },
                { path: ":pageTitle", element: <PageBuilder /> },
                { path: "guardian-upgrade-costs", element: <GuardianCosts /> },
                { path: "immortal-guardians", element: <ImmortalGuardians /> },
                { path: "flea-guide/", element: <Checklist checklistId={1} /> },

                { path: "editor-test/", element: <EditorExample /> },
                { path: "404/", element: <NotFound /> },
                { path: "*", element: <PageBuilder /> },
            ],
        },
    ];

    const router = createBrowserRouter(routes);
    return <RouterProvider router={router} />;
}

export default AppRouter;
