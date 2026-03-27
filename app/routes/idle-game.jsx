import IdleGame from "../../src/components/mini-apps/IdleGame";
import { themeToStyle, THEME_DEFAULTS } from "../../src/contexts/ThemeProvider";

export const handle = { title: "Idle RPG" };

export default function IdleGameRoute() {
    return (
        <div
            style={{
                ...themeToStyle(THEME_DEFAULTS),
                background: "var(--accent)",
                color: "var(--text-color)",
                minHeight: "100dvh",
            }}
        >
            <IdleGame />
        </div>
    );
}
