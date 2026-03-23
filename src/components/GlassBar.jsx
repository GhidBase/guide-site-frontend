import { forwardRef } from "react";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";

/**
 * Shared glass bar wrapper used by TopBar, HorizontalNavbar, and Footer.
 * Renders as `div` by default; pass `as="footer"` etc for semantic overrides.
 */
const GlassBar = forwardRef(function GlassBar({ as: Tag = "div", borderSide = "bottom", style, children, ...props }, ref) {
    const { darkMode } = useDarkMode();
    const border = darkMode
        ? "1px solid rgba(232,213,183,0.06)"
        : "1px solid rgba(180,90,30,0.10)";

    return (
        <Tag
            ref={ref}
            style={{
                background: darkMode
                    ? "linear-gradient(180deg, rgba(10,8,6,0.72) 0%, rgba(10,8,6,0.38) 100%)"
                    : "rgba(255,240,215,0.45)",
                backdropFilter: "blur(28px) saturate(1.6)",
                WebkitBackdropFilter: "blur(28px) saturate(1.6)",
                ...(borderSide === "bottom" ? { borderBottom: border } : { borderTop: border }),
                boxShadow: darkMode
                    ? "0 1px 0 rgba(255,255,255,0.03), 0 4px 32px rgba(0,0,0,0.55), 0 16px 48px rgba(0,0,0,0.2)"
                    : "none",
                color: darkMode ? "#e8d5b7" : "#2d1206",
                fontFamily: "'Outfit', sans-serif",
                ...style,
            }}
            {...props}
        >
            {children}
        </Tag>
    );
});

export default GlassBar;
