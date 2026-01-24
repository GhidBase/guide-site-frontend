import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { PageProvider } from "./contexts/PageProvider.jsx";
import "./index.css";
import { AppRouter } from "./routes.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <PageProvider>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </PageProvider>
    </StrictMode>,
);
