import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./tailwind.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import routes from "./routes.jsx";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router}></RouterProvider>
    </StrictMode>,
);
