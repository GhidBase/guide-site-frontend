import "../css/tables.css";
import { Outlet, useLoaderData, useLocation } from "react-router";
import Navbar from "./navbar/Navbar.jsx";
import HorizontalNavbar from "./navbar/HorizontalNavbar.jsx";
import TopBar from "./TopBar.jsx";
import MobileBottomBar from "./MobileBottomBar.jsx";
import MobileNavbar from "./navbar/MobileNavbar.jsx";
import { useEffect, useState } from "react";
import { usePageTracking } from "../hooks/usePageTracking.js";
import { useTheme, themeToStyle, useDarkMode, computeDarkTheme, THEME_DEFAULTS } from "../contexts/ThemeProvider.jsx";
import { EditModeProvider } from "../contexts/EditModeContext.jsx";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import Footer from "./Footer.jsx";

export default function Main() {
    usePageTracking();
    const [navOpen, setNavOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [navbarLayout, setNavbarLayout] = useState("horizontal");

    function toggleSidebar() {
        setSidebarCollapsed((prev) => !prev);
    }

    function toggleNavbarLayout() {
        setNavbarLayout((prev) => (prev === "vertical" ? "horizontal" : "vertical"));
    }
    const { gameData, sectionsMap, pageData } = useLoaderData();
    const { pathname } = useLocation();
    const { setTheme } = useTheme();
    const { darkMode } = useDarkMode();

    useEffect(() => {
        setTheme(gameData?.theme ?? null);
    }, [gameData?.id]);

    useEffect(() => {
        const el = document.getElementById("sticky-header");
        if (!el) return;
        const update = () =>
            document.documentElement.style.setProperty(
                "--sticky-header-height",
                el.offsetHeight + "px",
            );
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const activeTheme = darkMode
        ? computeDarkTheme(gameData?.theme ?? THEME_DEFAULTS)
        : gameData?.theme ?? null;

    function toggleNav(state) {
        // I go by typeof because events can
        // sometimes get sneakily passed in
        if (typeof state == "boolean") {
            setNavOpen(state);
        } else {
            setNavOpen(!navOpen);
        }
    }

    useEffect(() => {
        if (navOpen) {
            const scrollY = window.scrollY;
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;

            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            const scrollY = Math.abs(
                parseInt(document.body.style.top || "0", 10),
            );

            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.paddingRight = "";

            window.scrollTo(0, scrollY);
        }
    }, [navOpen]);

    const isWide = pageData?.page?.wide ?? false;
    const accentColor = activeTheme?.primary ?? "#9b6a4e";

    return (
        <EditModeProvider>
        <div
            id="main-page-sections"
            className="h-full w-full flex flex-col grow box-border bg-(--surface-background)"
            style={{
                ...themeToStyle(activeTheme),
                ...(pathname === "/" ? {
                    background: darkMode
                        ? "linear-gradient(90deg, #140f0a, #0c0906, #0c0906, #0c0906, #0c0906, #0c0906, #140f0a)"
                        : "linear-gradient(90deg, #f4e9d8, #faf5ee, #faf5ee, #faf5ee, #faf5ee, #faf5ee, #f4e9d8)",
                    backgroundSize: "500% 100%",
                    animation: "homepage-bg-lr 40s ease-in-out infinite alternate",
                } : {}),
            }}
        >
            {/* Ambient flares */}
            <style>{`
                @keyframes homepage-bg-shift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes homepage-bg-lr {
                    0%   { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                @keyframes flare-drift-1 {
                    0%   { transform: translate(0, 0) scale(1); }
                    33%  { transform: translate(4vw, -6vh) scale(1.08); }
                    66%  { transform: translate(-3vw, 4vh) scale(0.95); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes flare-drift-2 {
                    0%   { transform: translate(0, 0) scale(1); }
                    40%  { transform: translate(-5vw, 5vh) scale(1.1); }
                    70%  { transform: translate(3vw, -4vh) scale(0.92); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes flare-drift-3 {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(6vw, 8vh) scale(1.12); }
                    100% { transform: translate(0, 0) scale(1); }
                }
            `}</style>
            <div aria-hidden="true" />
            <div id="sticky-header" className={`sticky top-0 z-40 ${pathname === "/" ? "" : "border-b border-(--outline)/50"}`}>
                <TopBar navbarLayout={navbarLayout} toggleNavbarLayout={toggleNavbarLayout} />
                {sectionsMap && navbarLayout === "horizontal" && (
                    <div className="hidden lg:block">
                        <HorizontalNavbar />
                    </div>
                )}
            </div>
            <div
                id="side-bar-and-content"
                className={`relative w-full box-border flex flex-1
                ${pathname === "/" ? "" : "bg-(--surface-background)"}
                transition-[padding] duration-300 ease-in-out
                ${gameData && !sidebarCollapsed && navbarLayout === "vertical" && "xl:pr-30 2xl:pr-60"} `}
            >
                {sectionsMap && navbarLayout === "vertical" && (
                    <Navbar
                        className={`
                            w-60 max-w-60 min-w-60 lg:min-w-0 z-3 lg:h-full
                            ${navOpen ? "fixed" : "hidden"} right-[50%] top-4 bottom-20 translate-x-1/2 lg:static lg:translate-x-0
                            hidden lg:flex lg:flex-col
                            ${sidebarCollapsed ? "lg:w-0 lg:border-r-0" : "lg:w-60 lg:border-r-4"}
                            border-4 border-(--outline) lg:border-t-0 lg:border-b-0 lg:border-l-0
                            bg-(--primary)
                            overflow-y-auto overflow-x-hidden whitespace-nowrap
                            transition-[width] duration-300 ease-in-out`}
                        obstructorClassName={`z-1 ${navOpen ? "fixed" : "hidden"} top-0 w-full h-full bg-black/30`}
                        toggleNav={toggleNav}
                        navOpen={navOpen}
                        toggleSidebar={toggleSidebar}
                        closeClassName={`
                            ${navOpen ? "fixed" : "hidden"}
                            w-60 max-w-100 bottom-4 h-16 z-2 right-[50%] translate-x-1/2
                            bg-(--primary) border-4 border-t-0 border-(--outline)`}
                    ></Navbar>
                )}
                {sectionsMap && navbarLayout === "vertical" && (
                    <div className="hidden lg:block w-0 overflow-visible self-start sticky top-3 z-10">
                        <button
                            onClick={toggleSidebar}
                            className="flex items-center justify-center ml-3 mt-3 p-1.5 rounded border-2 cursor-pointer hover:opacity-80"
                            style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "var(--primary)", borderColor: darkMode ? "rgba(255,235,200,0.15)" : "var(--outline)" }}
                            title={
                                sidebarCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            {sidebarCollapsed ? (
                                <PanelLeftOpen className="w-5 h-5 text-amber-50" />
                            ) : (
                                <PanelLeftClose className="w-5 h-5 text-amber-50" />
                            )}
                        </button>
                    </div>
                )}
                <div
                    id="page-outer-bounds"
                    className={`gap-4 sm:px-4 pb-4 flex flex-col w-full mx-auto text-(--text-color) ${isWide ? "max-w-[1440px]" : "max-w-230"}`}
                >
                    <Outlet />
                </div>
            </div>

            <Footer />

            {sectionsMap && (
                <MobileNavbar
                    toggleNav={toggleNav}
                    className={`${!navOpen ? "hidden" : "lg:fixed"}`}
                    navOpen={navOpen}
                />
            )}

            <MobileBottomBar toggleNav={toggleNav} />
        </div>
        </EditModeProvider>
    );
}
