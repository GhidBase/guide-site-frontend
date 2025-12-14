import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Checklist from "./components/Checklist.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Checklist checklistId="1" />
    </StrictMode>
);
