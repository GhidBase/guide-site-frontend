import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({ theme: null, setTheme: () => {} });
const DarkModeContext = createContext({ darkMode: false, toggleDarkMode: () => {} });

// ── Color utilities ──────────────────────────────────────────────

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return "#" + [f(0), f(8), f(4)]
        .map(x => Math.round(x * 255).toString(16).padStart(2, "0"))
        .join("");
}

function setL(hex, targetL) {
    const [h, s] = hexToHsl(hex);
    return hslToHex(h, s, targetL);
}

/** Auto-compute a dark variant of any game theme */
export function computeDarkTheme(theme) {
    const t = { ...THEME_DEFAULTS, ...theme };
    return {
        primary:           setL(t.primary,           48),
        secondary:         setL(t.secondary,         42),
        accent:            setL(t.accent,            10),
        surfaceBackground: setL(t.surfaceBackground,  7),
        outline:           setL(t.outline,           32),
        textColor:         setL(t.textColor,         80),
        accentText:        setL(t.accentText,        82),
    };
}

// ── Providers ────────────────────────────────────────────────────

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(null);
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function DarkModeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(
        () => typeof window !== "undefined" && localStorage.getItem("darkMode") === "true"
    );

    function toggleDarkMode() {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem("darkMode", String(next));
            return next;
        });
    }

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

export function useDarkMode() {
    return useContext(DarkModeContext);
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

export const ANIMATION_DEFAULTS = {
    pageTransition: "fade",       // "fade" | "slide-up" | "slide-left" | "none"
    transitionDuration: 300,      // ms, 100–800
    blockEntrance: "fade-up",     // "fade-up" | "fade-in" | "pop" | "none"
    scrollReveal: true,           // animate blocks as they scroll into view
    hoverEffect: "lift",          // "lift" | "glow" | "none"
    navbarBlur: 28,               // px, backdrop-filter blur on navbar/topbar (4–60)
    cardRadius: 12,               // px, border-radius on cards (0–32)
    buttonRadius: 6,              // px, border-radius on buttons (0–24)
};

export const ANIMATION_FIELDS = [
    {
        key: "pageTransition",
        label: "Page Transition",
        description: "Animation when navigating between pages",
        type: "select",
        options: [
            { value: "fade", label: "Fade" },
            { value: "slide-up", label: "Slide Up" },
            { value: "slide-left", label: "Slide Left" },
            { value: "none", label: "None" },
        ],
    },
    {
        key: "transitionDuration",
        label: "Transition Speed",
        description: "Duration of page transitions (ms)",
        type: "range",
        min: 100,
        max: 800,
        step: 50,
    },
    {
        key: "blockEntrance",
        label: "Block Entrance",
        description: "How content blocks animate in",
        type: "select",
        options: [
            { value: "fade-up", label: "Fade Up" },
            { value: "fade-in", label: "Fade In" },
            { value: "pop", label: "Pop" },
            { value: "none", label: "None" },
        ],
    },
    {
        key: "scrollReveal",
        label: "Scroll Reveal",
        description: "Animate blocks as they enter the viewport",
        type: "toggle",
    },
    {
        key: "hoverEffect",
        label: "Hover Effect",
        description: "Effect on interactive cards and buttons",
        type: "select",
        options: [
            { value: "lift", label: "Lift (shadow)" },
            { value: "glow", label: "Glow" },
            { value: "none", label: "None" },
        ],
    },
    {
        key: "navbarBlur",
        label: "Navbar Blur",
        description: "Backdrop blur strength on navbar (px)",
        type: "range",
        min: 0,
        max: 60,
        step: 2,
    },
    {
        key: "cardRadius",
        label: "Card Radius",
        description: "Border radius on cards (px)",
        type: "range",
        min: 0,
        max: 32,
        step: 1,
    },
    {
        key: "buttonRadius",
        label: "Button Radius",
        description: "Border radius on buttons (px)",
        type: "range",
        min: 0,
        max: 24,
        step: 1,
    },
];

/** Convert a theme object into React inline style CSS custom properties */
export function themeToStyle(theme) {
    if (!theme) return {};
    const anim = { ...ANIMATION_DEFAULTS, ...(theme.animations ?? {}) };
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
        // Animation/style vars
        "--transition-duration": anim.transitionDuration + "ms",
        "--navbar-blur": anim.navbarBlur + "px",
        "--card-radius": anim.cardRadius + "px",
        "--button-radius": anim.buttonRadius + "px",
        "--hover-effect": anim.hoverEffect,
        "--block-entrance": anim.blockEntrance,
        "--page-transition": anim.pageTransition,
    };
}
