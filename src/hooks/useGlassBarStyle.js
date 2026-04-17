import { useDarkMode, useTheme, THEME_DEFAULTS } from "../contexts/ThemeProvider.jsx";

function hexLuminance(hex) {
    if (!hex || hex.length < 7) return 0.5;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function useGlassBarStyle(borderSide = "bottom") {
    const { darkMode } = useDarkMode();
    const { theme } = useTheme();
    const primary = theme?.primary ?? THEME_DEFAULTS.primary;
    const lightTextColor = hexLuminance(primary) < 0.35 ? "var(--accent, #f0e3c3)" : "var(--accent-text, #3a2a1a)";
    const border = darkMode
        ? "1px solid rgba(232,213,183,0.06)"
        : "1px solid color-mix(in srgb, var(--outline, #352b22) 30%, transparent)";

    return {
        background: darkMode
            ? "linear-gradient(180deg, rgba(10,8,6,0.72) 0%, rgba(10,8,6,0.38) 100%)"
            : "color-mix(in srgb, var(--primary, #794e3b) 88%, transparent)",
        backdropFilter: "blur(28px) saturate(1.6)",
        WebkitBackdropFilter: "blur(28px) saturate(1.6)",
        ...(borderSide === "bottom" ? { borderBottom: border } : { borderTop: border }),
        boxShadow: darkMode
            ? "0 1px 0 rgba(255,255,255,0.03), 0 4px 32px rgba(0,0,0,0.55), 0 16px 48px rgba(0,0,0,0.2)"
            : "none",
        color: darkMode ? "#e8d5b7" : lightTextColor,
        fontFamily: "'Outfit', sans-serif",
    };
}
