import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { useRouteLoaderData } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { LogOut, ArrowUpRight, LogIn } from "lucide-react";

// ── Component ────────────────────────────────────────────────────

export default function GuideCodexHomepage() {
    const { pageData } = useRouteLoaderData("main");
    const { isAuthenticated, user, logout } = useAuth();
    const blocks = pageData?.blocks ?? [];
    function parseBlockCards(block) {
        const c = block.content;
        if (!c) return [];
        let data;
        if (typeof c === "object") {
            if (c.type === "richText" && typeof c.content === "string") {
                try { data = JSON.parse(c.content); } catch { return []; }
            } else {
                data = c;
            }
        } else if (typeof c === "string") {
            try { data = JSON.parse(c); } catch { return []; }
        }
        return data?.cards ?? [];
    }

    const allCards = blocks
        .filter((b) => b.type === "image-text")
        .sort((a, b) => a.order - b.order)
        .flatMap((b) => parseBlockCards(b));
    const cardRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute("data-visible", "true");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08 },
        );
        cardRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [allCards]);

    return (
        <>
            <style>{`
                /* ── Entrance animations ── */
                @keyframes gcx-from-left {
                    from { opacity: 0; transform: translateX(-50px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes gcx-from-right {
                    from { opacity: 0; transform: translateX(50px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes gcx-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes gcx-line-expand {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
                @keyframes gcx-hero-glow-pulse {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50%      { opacity: 0.16; transform: scale(1.06); }
                }
                @keyframes gcx-float {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-6px); }
                }
                @keyframes gcx-bar-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes gcx-section-label {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Hero ── */
                .gcx-word-guide {
                    display: block;
                    animation: gcx-from-left 1.1s cubic-bezier(0.16,1,0.3,1) 0.05s both;
                }
                .gcx-word-codex {
                    display: block;
                    animation: gcx-from-right 1.1s cubic-bezier(0.16,1,0.3,1) 0.2s both;
                }
                .gcx-hero-sub {
                    animation: gcx-fade-in 0.8s ease 0.65s both;
                }
                .gcx-hero-line {
                    transform-origin: left;
                    animation: gcx-line-expand 1.2s cubic-bezier(0.16,1,0.3,1) 0.55s both;
                }
                .gcx-header {
                    animation: gcx-fade-in 0.6s ease 0s both;
                }
                .gcx-hero-glow {
                    animation: gcx-hero-glow-pulse 6s ease-in-out infinite;
                }
                .gcx-section-label {
                    animation: gcx-section-label 0.7s ease 0.3s both;
                }

                /* ── Cards ── */
                .gcx-card {
                    opacity: 0;
                    transform: translateY(64px) rotate(0.6deg);
                    transition: opacity 0.95s cubic-bezier(0.16,1,0.3,1),
                                transform 0.95s cubic-bezier(0.16,1,0.3,1);
                }
                .gcx-card[data-visible="true"] {
                    opacity: 1;
                    transform: translateY(0) rotate(0deg);
                }
                .gcx-card[data-visible="true"]:nth-child(2) { transition-delay: 0.07s; }
                .gcx-card[data-visible="true"]:nth-child(3) { transition-delay: 0.14s; }

                .gcx-card-inner {
                    transition: transform 0.55s cubic-bezier(0.16,1,0.3,1),
                                box-shadow 0.55s cubic-bezier(0.16,1,0.3,1);
                }
                .gcx-card:hover .gcx-card-inner {
                    transform: translateY(-6px) scale(1.005);
                }

                .gcx-img {
                    transition: transform 0.85s cubic-bezier(0.16,1,0.3,1);
                }
                .gcx-card:hover .gcx-img {
                    transform: scale(1.07);
                }

                /* ── Title shimmer on hover ── */
                .gcx-title {
                    transition: text-shadow 0.4s ease, color 0.3s ease;
                }
                .gcx-card:hover .gcx-title {
                    text-shadow: 0 0 48px rgba(245,237,224,0.22);
                    color: #ffffff;
                }

                /* ── Accent bar ── */
                .gcx-accent-bar {
                    width: 0;
                    transition: width 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s;
                }
                .gcx-card[data-visible="true"] .gcx-accent-bar {
                    width: 3rem;
                }
                .gcx-card:hover .gcx-accent-bar {
                    background: linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.9) 50%, currentColor 100%) !important;
                    background-size: 200% auto !important;
                    animation: gcx-bar-shimmer 1.2s linear infinite !important;
                }

                /* ── Explore link ── */
                .gcx-link {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .gcx-link::after {
                    content: '';
                    position: absolute;
                    bottom: -1px; left: 0;
                    width: 0; height: 1px;
                    background: currentColor;
                    transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
                }
                .gcx-link:hover::after { width: 100%; }
                .gcx-link svg {
                    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
                }
                .gcx-link:hover svg { transform: translate(3px, -3px); }

                /* ── Mobile ── */
                @media (max-width: 700px) {
                    .gcx-card-inner { flex-direction: column !important; }
                    .gcx-img-panel { width: 100% !important; height: 220px !important; }
                }
            `}</style>


            {/* Grain overlay */}
            <div
                aria-hidden
                style={{
                    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    opacity: 0.032,
                }}
            />

            {/* ── Header ── */}
            <header
                className="gcx-header"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.25rem 2.5rem",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: "rgba(10,8,6,0.8)",
                    backdropFilter: "blur(24px)",
                    borderBottom: "1px solid rgba(232,213,183,0.05)",
                    boxShadow: "0 1px 32px rgba(0,0,0,0.4)",
                    color: "#e8d5b7",
                }}
            >
                <span style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    opacity: 0.35,
                    fontWeight: 700,
                }}>
                    GuideCodex
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {isAuthenticated ? (
                        <>
                            <span style={{ fontSize: "0.68rem", opacity: 0.28 }}>{user?.username}</span>
                            <button
                                onClick={logout}
                                style={{ opacity: 0.5, cursor: "pointer", background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.28)}
                            >
                                <LogOut size={13} />
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            title="Sign in"
                            style={{
                                color: "rgba(232,220,200,0.7)", textDecoration: "none",
                                border: "1px solid rgba(232,220,200,0.2)", borderRadius: "4px",
                                padding: "0.25rem 0.4rem", transition: "all 0.2s",
                                background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(232,220,200,1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(232,220,200,0.7)"; }}
                        >
                            <LogIn size={13} />
                        </Link>
                    )}
                </div>
            </header>

            <div
                style={{
                    background: "#0a0806",
                    color: "#e8d5b7",
                    minHeight: "100vh",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* ── Hero ── */}
                <section style={{
                    padding: "calc(12vh + 4rem) 2.5rem 10vh",
                    maxWidth: "1280px",
                    width: "100%",
                    margin: "0 auto",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Ambient glow blob */}
                    <div className="gcx-hero-glow" style={{
                        position: "absolute",
                        top: "50%", left: "30%",
                        width: "600px", height: "400px",
                        background: "radial-gradient(ellipse, #9b6a4e 0%, transparent 70%)",
                        filter: "blur(80px)",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        zIndex: 0,
                    }} />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                            fontSize: "clamp(4.5rem, 15vw, 12rem)",
                            fontWeight: 900,
                            lineHeight: 0.9,
                            letterSpacing: "-0.04em",
                            userSelect: "none",
                        }}>
                            <span className="gcx-word-guide" style={{ color: "#f5ede0", textShadow: "0 4px 60px rgba(245,237,224,0.08)" }}>
                                Guide
                            </span>
                            <span className="gcx-word-codex" style={{
                                color: "#9b6a4e",
                                display: "block",
                                textAlign: "right",
                                textShadow: "0 4px 60px rgba(155,106,78,0.3)",
                            }}>
                                Codex
                            </span>
                        </div>

                        <div className="gcx-hero-sub" style={{
                            display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "2.5rem",
                        }}>
                            </div>
                    </div>
                </section>

                {/* ── Games ── */}
                {allCards.length > 0 && (
                    <section style={{
                        maxWidth: "1280px",
                        width: "100%",
                        margin: "0 auto",
                        padding: "0 2.5rem 10rem",
                        boxSizing: "border-box",
                    }}>
                        {/* Section label */}
                        <div className="gcx-section-label" style={{
                            display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem",
                        }}>
                            <span style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.3, whiteSpace: "nowrap" }}>
                                Games we cover
                            </span>
                            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(232,213,183,0.12), transparent)" }} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                            {allCards.map((card, i) => {
                                const primary = card.accentColor || "#9b6a4e";
                                const isEven = i % 2 === 0;
                                const isExternal = card.linkUrl?.startsWith("http://") || card.linkUrl?.startsWith("https://");

                                return (
                                    <div
                                        key={card.id ?? i}
                                        ref={(el) => (cardRefs.current[i] = el)}
                                        className="gcx-card"
                                        style={{ transitionDelay: `${i * 0.06}s` }}
                                    >
                                        <div
                                            className="gcx-card-inner"
                                            style={{
                                                display: "flex",
                                                flexDirection: isEven ? "row" : "row-reverse",
                                                borderRadius: "14px",
                                                overflow: "hidden",
                                                boxShadow: `0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)`,
                                                minHeight: "320px",
                                                border: "1px solid rgba(232,213,183,0.06)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = `0 24px 72px rgba(0,0,0,0.65), 0 0 48px ${primary}35, inset 0 1px 0 rgba(255,255,255,0.06)`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)`;
                                            }}
                                        >
                                            {/* Image panel */}
                                            {card.imageUrl && (
                                                <div
                                                    className="gcx-img-panel"
                                                    style={{ width: "45%", flexShrink: 0, overflow: "hidden", position: "relative" }}
                                                >
                                                    <img
                                                        src={card.imageUrl}
                                                        alt={card.title}
                                                        className="gcx-img"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                                                    />
                                                    <div style={{
                                                        position: "absolute", inset: 0,
                                                        background: isEven
                                                            ? "linear-gradient(to right, transparent 70%, rgba(10,8,6,0.35))"
                                                            : "linear-gradient(to left, transparent 70%, rgba(10,8,6,0.35))",
                                                        pointerEvents: "none",
                                                    }} />
                                                </div>
                                            )}

                                            {/* Text panel */}
                                            <div style={{
                                                flex: 1,
                                                background: `linear-gradient(135deg, ${primary}18 0%, #0e0b08 50%, #0a0806 100%)`,
                                                borderLeft: isEven ? `3px solid ${primary}` : "none",
                                                borderRight: !isEven ? `3px solid ${primary}` : "none",
                                                padding: "2.75rem",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                gap: "1.1rem",
                                                boxSizing: "border-box",
                                                position: "relative",
                                                overflow: "hidden",
                                            }}>
                                                <div style={{
                                                    position: "absolute",
                                                    [isEven ? "left" : "right"]: "-40px",
                                                    top: "-40px",
                                                    width: "180px", height: "180px",
                                                    background: `radial-gradient(circle, ${primary}22 0%, transparent 70%)`,
                                                    pointerEvents: "none",
                                                }} />

                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", position: "relative" }}>
                                                    <div
                                                        className="gcx-accent-bar"
                                                        style={{ height: "2px", background: primary, borderRadius: "2px", flexShrink: 0, color: primary }}
                                                    />
                                                    <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>
                                                        {String(i + 1).padStart(2, "0")}
                                                    </span>
                                                </div>

                                                <h2
                                                    className="gcx-title"
                                                    style={{
                                                        fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                                                        fontWeight: 800,
                                                        lineHeight: 1.05,
                                                        letterSpacing: "-0.03em",
                                                        color: "#f5ede0",
                                                        margin: 0,
                                                        position: "relative",
                                                    }}
                                                >
                                                    {card.title}
                                                </h2>

                                                {card.description && (
                                                    <p style={{
                                                        fontSize: "0.875rem",
                                                        lineHeight: 1.75,
                                                        color: "rgba(232,213,183,0.52)",
                                                        maxWidth: "48ch",
                                                        margin: 0,
                                                        position: "relative",
                                                    }}>
                                                        {card.description}
                                                    </p>
                                                )}

                                                {card.linkUrl && (
                                                    isExternal ? (
                                                        <a
                                                            href={card.linkUrl}
                                                            className="gcx-link"
                                                            style={{ color: primary, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em", textDecoration: "none", marginTop: "0.5rem", width: "fit-content", position: "relative" }}
                                                        >
                                                            {card.linkText || "Explore guides"}
                                                            <ArrowUpRight size={14} />
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            to={card.linkUrl}
                                                            className="gcx-link"
                                                            style={{ color: primary, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em", textDecoration: "none", marginTop: "0.5rem", width: "fit-content", position: "relative" }}
                                                        >
                                                            {card.linkText || "Explore guides"}
                                                            <ArrowUpRight size={14} />
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </div>
        </>
    );
}
