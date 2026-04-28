import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    const { darkMode } = useDarkMode();

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > 300);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            style={{
                position: "fixed",
                bottom: "5rem",
                right: "1.25rem",
                zIndex: 50,
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transition: "opacity 0.25s ease",
                background: darkMode ? "rgba(255,235,200,0.10)" : "var(--primary)",
                border: darkMode ? "1px solid rgba(255,235,200,0.15)" : "2px solid var(--outline)",
                borderRadius: "0.5rem",
                padding: "0.4rem",
                cursor: "pointer",
                color: darkMode ? "#e8d5b7" : "var(--accent, #f0e3c3)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
        >
            <ChevronUp className="w-5 h-5" />
        </button>
    );
}
