import { useLocation, Link } from "react-router";
import { useGlassBarStyle } from "../hooks/useGlassBarStyle.js";
export default function Footer() {
    const { pathname } = useLocation();
    const glassStyle = useGlassBarStyle("top");
    if (pathname === "/") return (
        <div style={{ ...glassStyle, padding: "1rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", fontSize: "0.68rem", opacity: 0.75, boxShadow: "none" }}>
            <span>© {new Date().getFullYear()} GuideCodex</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <Link
                to="/privacy-policy"
                style={{ color: "inherit", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.6)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            >
                Privacy Policy
            </Link>
        </div>
    );
    return (
        <footer style={{ ...glassStyle, padding: "1rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", fontSize: "0.68rem", opacity: 0.75, boxShadow: "none" }}>
            <span>© {new Date().getFullYear()} GuideCodex</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <Link to="/privacy-policy" style={{ color: "inherit", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.6)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            >Privacy Policy</Link>
        </footer>
    );
}
