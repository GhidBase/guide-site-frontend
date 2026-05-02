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

function hexToRgb(hex) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}


// ── Defaults ─────────────────────────────────────────────────────

export const THEME_DEFAULTS = {
    primary: "#794e3b",
    secondary: "#845744",
    accent: "#f0e3c3",
    surfaceBackground: "#d1bc9f",
    outline: "#352b22",
    textColor: "#604f45",
    accentText: "#3a2a1a",
};

/** Auto-compute a dark variant of any light theme */
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

export const THEME_DEFAULTS_DARK = computeDarkTheme(THEME_DEFAULTS);

export const BACKGROUND_DEFAULTS = {
    type: "solid",
    gradientType: "linear",
    gradientAngle: 135,
    gradientStops: [
        { color: "#794e3b", position: 0 },
        { color: "#d1bc9f", position: 100 },
    ],
    imageUrl: "",
    imageSize: "cover",
    imageOverlayOpacity: 0.35,
    imageOverlayColor: "#1a0d07",
    gradientAnimation: "none",
    gradientAnimationSpeed: 8,
};

export function computeBackground(bg, colors) {
    if (!bg || bg.type === "solid") return colors.surfaceBackground;

    if (bg.type === "gradient") {
        const rawStops = bg.gradientStops ?? BACKGROUND_DEFAULTS.gradientStops;
        const anim = bg.gradientAnimation ?? "none";
        const staticAngle = bg.gradientAngle ?? 135;
        const angle = anim === "rotate" ? "var(--gc-angle)" : `${staticAngle}deg`;
        const stopStr = rawStops.map(s => `${s.color} ${s.position}%`).join(", ");

        if (bg.gradientType === "radial")
            return `radial-gradient(ellipse at center, ${stopStr})`;

        if (bg.gradientType === "spotlight")
            return `radial-gradient(ellipse 90% 70% at 50% -5%, ${stopStr})`;

        if (bg.gradientType === "corner")
            return `radial-gradient(ellipse at top left, ${stopStr})`;

        if (bg.gradientType === "conic")
            return `conic-gradient(from ${angle}, ${stopStr})`;

        if (bg.gradientType === "stripes") {
            const parts = [rawStops[0].color + " " + rawStops[0].position + "%"];
            for (let i = 1; i < rawStops.length; i++) {
                parts.push(rawStops[i - 1].color + " " + rawStops[i].position + "%");
                parts.push(rawStops[i].color + " " + rawStops[i].position + "%");
            }
            return `linear-gradient(${angle}, ${parts.join(", ")})`;
        }

        if (bg.gradientType === "mesh") {
            const blobs = rawStops.slice(0, 4);
            const positions = ["20% 25%", "80% 75%", "10% 80%", "90% 20%"];
            const base = blobs[blobs.length - 1]?.color ?? colors.surfaceBackground;
            const layers = blobs.slice(0, -1).map((s, i) => {
                const { r, g, b } = hexToRgb(s.color);
                return `radial-gradient(ellipse at ${positions[i]}, rgba(${r},${g},${b},0.75), transparent 55%)`;
            });
            return [...layers, base].join(", ");
        }

        return `linear-gradient(${angle}, ${stopStr})`;
    }

    if (bg.type === "image") {
        if (!bg.imageUrl) return colors.surfaceBackground;
        const opacity = bg.imageOverlayOpacity ?? 0.35;
        const oc = bg.imageOverlayColor ?? colors.surfaceBackground;
        const { r, g, b } = hexToRgb(oc);
        const overlay = `linear-gradient(rgba(${r},${g},${b},${opacity}),rgba(${r},${g},${b},${opacity}))`;
        const size = bg.imageSize === "repeat" ? "auto" : (bg.imageSize ?? "cover");
        const repeat = bg.imageSize === "repeat" ? "repeat" : "no-repeat";
        return `${overlay}, url("${bg.imageUrl}") center/${size} ${repeat}`;
    }

    return colors.surfaceBackground;
}

/**
 * Normalize any stored theme to the split { light, dark, animations, background } format.
 * Old flat themes are wrapped transparently; already-split themes pass through.
 */
export function normalizeTheme(theme) {
    if (!theme) return null;
    if (theme.light && theme.dark) return {
        ...theme,
        background: theme.background ?? { ...BACKGROUND_DEFAULTS },
        backgroundPresets: theme.backgroundPresets ?? [],
    };
    // Old flat format — strip non-color keys
    const { animations, background, backgroundPresets, ...colors } = theme;
    const light = { ...THEME_DEFAULTS, ...colors };
    return {
        light,
        dark: computeDarkTheme(light),
        animations: animations ?? {},
        background: background ?? { ...BACKGROUND_DEFAULTS },
        backgroundPresets: backgroundPresets ?? [],
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
        () => typeof window !== "undefined" && localStorage.getItem("darkMode") !== "false"
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

// ── Hooks ─────────────────────────────────────────────────────────

export function useTheme() {
    return useContext(ThemeContext);
}

export function useDarkMode() {
    return useContext(DarkModeContext);
}

/** Returns the flat color object for the currently active mode */
export function useActiveColors() {
    const { theme } = useTheme();
    const { darkMode } = useDarkMode();
    if (!theme) return darkMode ? THEME_DEFAULTS_DARK : THEME_DEFAULTS;
    const normalized = normalizeTheme(theme);
    return darkMode ? normalized.dark : normalized.light;
}

// ── Field definitions ─────────────────────────────────────────────

export const THEME_FIELDS = [
    { key: "primary",           label: "Primary",      description: "Buttons, navbar, header" },
    { key: "secondary",         label: "Secondary",    description: "Background stripe" },
    { key: "surfaceBackground", label: "Surface",      description: "Main content area" },
    { key: "accent",            label: "Accent",       description: "Cards and panels" },
    { key: "outline",           label: "Borders",      description: "Lines and borders" },
    { key: "textColor",         label: "Text",         description: "General text" },
    { key: "accentText",        label: "Accent Text",  description: "Text on cards" },
];

export const ANIMATION_DEFAULTS = {
    pageTransition: "fade",
    transitionDuration: 300,
    blockEntrance: "fade-up",
    scrollReveal: true,
    hoverEffect: "lift",
    navbarBlur: 28,
    cardRadius: 12,
    buttonRadius: 6,
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

/** Convert a split theme + darkMode into CSS custom properties for inline style */
export function themeToStyle(theme, darkMode = false) {
    const normalized = theme
        ? normalizeTheme(theme)
        : { light: THEME_DEFAULTS, dark: THEME_DEFAULTS_DARK, animations: {}, background: { ...BACKGROUND_DEFAULTS } };
    const colors = darkMode ? normalized.dark : normalized.light;
    const anim = { ...ANIMATION_DEFAULTS, ...(normalized.animations ?? {}) };
    const pageBg = computeBackground(normalized.background, colors);
    return {
        "--red-brown":           colors.primary,
        "--primary":             colors.primary,
        "--khaki-brown":         colors.secondary,
        "--secondary":           colors.secondary,
        "--accent":              colors.accent,
        "--surface-background":  colors.surfaceBackground,
        "--outline-brown":       colors.outline,
        "--outline":             colors.outline,
        "--text-color":          colors.textColor,
        "--accent-text":         colors.accentText,
        "--transition-duration": anim.transitionDuration + "ms",
        "--navbar-blur":         anim.navbarBlur + "px",
        "--card-radius":         anim.cardRadius + "px",
        "--button-radius":       anim.buttonRadius + "px",
        "--hover-effect":        anim.hoverEffect,
        "--block-entrance":      anim.blockEntrance,
        "--page-transition":     anim.pageTransition,
        "--page-background":     pageBg,
        "--gc-speed":            `${normalized.background?.gradientAnimationSpeed ?? BACKGROUND_DEFAULTS.gradientAnimationSpeed}s`,
    };
}
