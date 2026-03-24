import { useRef, useState, useEffect } from "react";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";
import { getOrbSettings, saveOrbSettings } from "./OrbTrail.jsx";
import { currentAPI } from "../config/api.js";
import { useNavigate } from "react-router";

const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function AccountPage() {
    const { user, logout } = useAuth();
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();
    const [orb, setOrb] = useState(() => getOrbSettings());
    const [uploading, setUploading] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        fetch(`${currentAPI}/users/me`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .then(p => { if (p?.avatarUrl) setAvatarSrc(p.avatarUrl); })
            .catch(() => {});
    }, []);

    function updateOrb(patch) {
        const next = { ...orb, ...patch };
        setOrb(next);
        saveOrbSettings(next);
        // Persist to backend (merge — backend does { ...existing, ...incoming })
        fetch(`${currentAPI}/users/me`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orbSettings: patch }),
        }).catch(() => {});
    }

    async function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setAvatarSrc(ev.target.result);
        reader.readAsDataURL(file);
        setUploading(true);
        try {
            const form = new FormData();
            form.append("avatar", file);
            const res = await fetch(`${currentAPI}/users/me/avatar`, { method: "POST", credentials: "include", body: form });
            if (res.ok) {
                const { avatarUrl } = await res.json();
                if (avatarUrl) setAvatarSrc(avatarUrl);
            }
        } finally {
            setUploading(false);
        }
    }

    const fg = "var(--text-color)";
    const cardBg = darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
    const border = darkMode ? "rgba(255,235,200,0.08)" : "rgba(0,0,0,0.09)";

    function Section({ title, children }) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4 }}>
                    {title}
                </span>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem", display: "flex", flexDirection: "column", gap: "2rem", color: fg, fontFamily: "'Outfit', sans-serif" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Account</h1>

            {/* Profile */}
            <Section title="Profile">
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <button
                        onClick={() => fileRef.current?.click()}
                        title="Change profile picture"
                        style={{
                            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                            background: darkMode ? "rgba(255,235,200,0.06)" : "rgba(0,0,0,0.06)",
                            border: `2px dashed ${border}`,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            overflow: "hidden", transition: "border-color 0.15s",
                        }}
                    >
                        {avatarSrc
                            ? <img src={avatarSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                            : <span style={{ fontSize: "1.4rem", opacity: 0.2 }}>+</span>
                        }
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "1rem" }}>{user?.username}</span>
                        <span style={{ fontSize: "0.72rem", opacity: 0.4 }}>
                            {uploading ? "Uploading..." : "tap avatar to change"}
                        </span>
                    </div>
                </div>
            </Section>

            {/* Cursor Trail */}
            <Section title="Cursor Trail">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Sparkles size={13} style={{ opacity: 0.45 }} />
                        <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>Enable trail</span>
                    </div>
                    <div
                        onClick={() => updateOrb({ enabled: !orb.enabled })}
                        style={{
                            width: 38, height: 20, borderRadius: 10,
                            background: orb.enabled ? "#794e3b" : border,
                            cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                        }}
                    >
                        <div style={{
                            width: 14, height: 14, borderRadius: "50%", background: "#fff",
                            position: "absolute", top: 3,
                            left: orb.enabled ? 21 : 3,
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                        }} />
                    </div>
                </div>

                {orb.enabled && (
                    <>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ fontSize: "0.8rem", opacity: 0.5, minWidth: 40 }}>Color</span>
                            <input
                                type="color"
                                value={orb.color}
                                onChange={e => updateOrb({ color: e.target.value })}
                                style={{ width: 32, height: 24, border: "none", borderRadius: 4, cursor: "pointer", padding: 0 }}
                            />
                            <span style={{ fontSize: "0.72rem", opacity: 0.3, fontFamily: "monospace", flex: 1 }}>{orb.color}</span>
                            <button
                                onClick={() => updateOrb({ color: "#c0c0c0" })}
                                style={{ fontSize: "0.72rem", opacity: 0.45, background: "none", border: "none", color: fg, cursor: "pointer", padding: 0, transition: "opacity 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
                            >reset</button>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ fontSize: "0.8rem", opacity: 0.5, minWidth: 40 }}>Style</span>
                            {[
                                { value: "gradient", label: "Gradient", desc: "uniform color fade" },
                                { value: "white-core", label: "White Core", desc: "colored glow + white center" },
                            ].map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => updateOrb({ style: s.value })}
                                    title={s.desc}
                                    style={{
                                        padding: "0.3rem 0.7rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 500,
                                        cursor: "pointer", transition: "all 0.15s",
                                        background: (orb.style ?? "gradient") === s.value ? orb.color : "transparent",
                                        color: (orb.style ?? "gradient") === s.value ? "#fff" : fg,
                                        border: `1px solid ${(orb.style ?? "gradient") === s.value ? orb.color : border}`,
                                        opacity: (orb.style ?? "gradient") === s.value ? 1 : 0.5,
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </Section>

            {/* Connected accounts */}
            <Section title="Sign In Methods">
                <a
                    href={`${currentAPI}/auth/google`}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.6rem 0.75rem", borderRadius: 7,
                        border: `1px solid ${border}`,
                        color: fg, textDecoration: "none", fontSize: "0.85rem", fontWeight: 500,
                        opacity: 0.7, transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                >
                    <GoogleIcon />
                    Connect Google account
                </a>
            </Section>

            {/* Sign out */}
            <button
                onClick={() => { logout(); navigate("/"); }}
                style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    background: "none", border: `1px solid ${border}`,
                    color: fg, borderRadius: 8, padding: "0.65rem 1rem",
                    cursor: "pointer", fontSize: "0.85rem", opacity: 0.5,
                    transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
            >
                <LogOut size={14} />
                Sign out
            </button>
        </div>
    );
}
