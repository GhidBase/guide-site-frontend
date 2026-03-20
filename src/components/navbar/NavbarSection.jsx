import { ChevronDown, ChevronRight } from "lucide-react";

export default function NavbarSection({ navbarTitle, isCollapsed, onToggle, darkMode }) {
    return (
        <button
            onClick={onToggle}
            className="w-full border-b cursor-pointer group"
            style={{
                background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.18)",
                borderColor: darkMode ? "rgba(255,235,200,0.08)" : "rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.6rem 1rem",
                fontFamily: "'Outfit', sans-serif",
            }}
        >
            <span
                style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,235,200,0.55)",
                    transition: "color 0.2s",
                }}
                className="group-hover:!text-amber-100/80"
            >
                {navbarTitle}
            </span>
            <span style={{ color: "rgba(255,235,200,0.35)", flexShrink: 0, transition: "transform 0.3s ease" }}
                  className={isCollapsed ? "" : "rotate-0"}>
                {isCollapsed
                    ? <ChevronRight className="w-3.5 h-3.5" />
                    : <ChevronDown className="w-3.5 h-3.5" />
                }
            </span>
        </button>
    );
}
