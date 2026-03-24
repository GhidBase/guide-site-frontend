import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";

export const ORB_KEY = "gc_orb";
export const ORB_DEFAULT = { enabled: false, color: "#c0c0c0", style: "gradient" };
// styles: "gradient" = uniform color fade | "white-core" = colored glow + white hot center

export function getOrbSettings() {
    try { return { ...ORB_DEFAULT, ...JSON.parse(localStorage.getItem(ORB_KEY)) }; }
    catch { return { ...ORB_DEFAULT }; }
}

export function saveOrbSettings(s) {
    localStorage.setItem(ORB_KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("gc-orb-change"));
}

export default function OrbTrail() {
    const { isAuthenticated } = useAuth();
    const canvasRef = useRef(null);
    const settingsRef = useRef(getOrbSettings());
    const pointsRef = useRef([]);
    const cursorRef = useRef({ x: -999, y: -999, active: false });
    const rafRef = useRef(null);

    // Sync settings + cursor style on change and on mount
    useEffect(() => {
        function sync() {
            settingsRef.current = getOrbSettings();
            document.body.style.setProperty("cursor", settingsRef.current.enabled ? "none" : "", "important");
        }
        sync(); // apply immediately on mount
        window.addEventListener("gc-orb-change", sync);
        return () => {
            window.removeEventListener("gc-orb-change", sync);
            document.body.style.removeProperty("cursor");
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        function onMove(e) {
            cursorRef.current = { x: e.clientX, y: e.clientY, active: true };
            if (!settingsRef.current.enabled) return;
            pointsRef.current.push({ x: e.clientX, y: e.clientY, life: 1 });
        }
        function onTouch(e) {
            const t = e.touches[0];
            if (!t) return;
            cursorRef.current = { x: t.clientX, y: t.clientY, active: true };
            if (!settingsRef.current.enabled) return;
            for (const touch of e.touches) {
                pointsRef.current.push({ x: touch.clientX, y: touch.clientY, life: 1 });
            }
        }
        function onLeave() { cursorRef.current.active = false; }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onTouch, { passive: true });
        document.addEventListener("mouseleave", onLeave);

        function frame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const { enabled, color } = settingsRef.current;

            if (enabled) {
                const orbStyle = settingsRef.current.style ?? "gradient";
                pointsRef.current = pointsRef.current.filter(p => p.life > 0.015);
                const { x, y, active } = cursorRef.current;

                if (orbStyle === "gradient") {
                    // ── Uniform gradient style ────────────────────────────────
                    for (const p of pointsRef.current) {
                        const r = 7 * p.life;
                        const alpha = Math.floor(p.life * p.life * 220).toString(16).padStart(2, "0");
                        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
                        grad.addColorStop(0, color + alpha);
                        grad.addColorStop(1, color + "00");
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                        ctx.fillStyle = grad;
                        ctx.fill();
                        p.life -= 0.038;
                    }
                    if (active) {
                        const halo = ctx.createRadialGradient(x, y, 0, x, y, 22);
                        halo.addColorStop(0, color + "55");
                        halo.addColorStop(1, color + "00");
                        ctx.beginPath();
                        ctx.arc(x, y, 22, 0, Math.PI * 2);
                        ctx.fillStyle = halo;
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                    }

                } else if (orbStyle === "white-core") {
                    // ── White hot core style ──────────────────────────────────
                    for (const p of pointsRef.current) {
                        const life2 = p.life * p.life;
                        const r = 5 * p.life;
                        ctx.save();
                        ctx.globalAlpha = life2 * 0.85;
                        ctx.shadowBlur = 10 * p.life;
                        ctx.shadowColor = color;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                        ctx.restore();
                        ctx.save();
                        ctx.globalAlpha = life2 * 0.7;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, r * 0.38, 0, Math.PI * 2);
                        ctx.fillStyle = "#fff";
                        ctx.fill();
                        ctx.restore();
                        p.life -= 0.038;
                    }
                    if (active) {
                        ctx.save();
                        ctx.globalAlpha = 0.55;
                        ctx.shadowBlur = 16;
                        ctx.shadowColor = color;
                        ctx.beginPath();
                        ctx.arc(x, y, 7, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                        ctx.restore();
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, Math.PI * 2);
                        ctx.fillStyle = "#fff";
                        ctx.fill();
                    }
                }
            }

            rafRef.current = requestAnimationFrame(frame);
        }
        frame();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("touchmove", onTouch);
            document.removeEventListener("mouseleave", onLeave);
            cancelAnimationFrame(rafRef.current);
            document.body.style.cursor = "";
        };
    }, [isAuthenticated]);

    if (!isAuthenticated) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }}
        />
    );
}
