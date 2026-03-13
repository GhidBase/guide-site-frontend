import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({ theme: null, setTheme: () => {} });

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(null);
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

export const THEME_DEFAULTS = {
    primary: "#794e3b",
    secondary: "#845744",
    accent: "#f0e3c3",
    surfaceBackground: "#d1bc9f",
    outline: "#352b22",
    textColor: "#604f45",
    accentText: "#3a2a1a",
};

export const THEME_FIELDS = [
    { key: "primary", label: "Primary", description: "Buttons, navbar, header" },
    { key: "secondary", label: "Secondary", description: "Background stripe" },
    { key: "surfaceBackground", label: "Surface", description: "Main content area" },
    { key: "accent", label: "Accent", description: "Cards and panels" },
    { key: "outline", label: "Borders", description: "Lines and borders" },
    { key: "textColor", label: "Text", description: "General text" },
    { key: "accentText", label: "Accent Text", description: "Text on cards" },
];

/** Convert a theme object into React inline style CSS custom properties */
export function themeToStyle(theme) {
    if (!theme) return {};
    return {
        "--red-brown": theme.primary,
        "--primary": theme.primary,
        "--khaki-brown": theme.secondary,
        "--secondary": theme.secondary,
        "--accent": theme.accent,
        "--surface-background": theme.surfaceBackground,
        "--outline-brown": theme.outline,
        "--outline": theme.outline,
        "--text-color": theme.textColor,
        "--accent-text": theme.accentText,
    };
}
