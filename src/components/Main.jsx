import "../css/tables.css";
import { Outlet, useLoaderData, useLocation } from "react-router";
import Navbar from "./navbar/Navbar.jsx";
import HorizontalNavbar from "./navbar/HorizontalNavbar.jsx";
import TopBar from "./TopBar.jsx";
import NavBarOpenButton from "./NavBarOpenButton.jsx";
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
    const { gameData, isLDG } = useLoaderData();
    const { pathname } = useLocation();
    const isHomepage = pathname === "/" && !isLDG;
    const { theme, setTheme } = useTheme();
    const { darkMode } = useDarkMode();

    useEffect(() => {
        setTheme(gameData?.theme ?? null);
    }, [gameData?.id]);

    const activeTheme = darkMode
        ? computeDarkTheme(theme ?? THEME_DEFAULTS)
        : theme;

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

    return (
        <EditModeProvider>
        <div
            id="main-page-sections"
            className={`h-full w-full flex flex-col grow box-border ${!isHomepage ? "bg-(--surface-background)" : ""}`}
            style={!isHomepage ? themeToStyle(activeTheme) : undefined}
        >
            {!isHomepage && <TopBar navbarLayout={navbarLayout} toggleNavbarLayout={toggleNavbarLayout} />}
            {gameData && navbarLayout === "horizontal" && (
                <div className="hidden lg:block">
                    <HorizontalNavbar />
                </div>
            )}
            <div
                id="side-bar-and-content"
                className={`relative w-full box-border flex flex-1
                ${!isHomepage ? "border-t-4 border-(--outline) bg-(--surface-background)" : ""}
                transition-[padding] duration-300 ease-in-out
                ${gameData && !sidebarCollapsed && navbarLayout === "vertical" && "xl:pr-30 2xl:pr-60"} `}
            >
                {gameData && navbarLayout === "vertical" && (
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
                {gameData && navbarLayout === "vertical" && (
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
                {isHomepage ? (
                    <Outlet />
                ) : (
                    <div
                        id="page-outer-bounds"
                        className={`gap-4 sm:px-4 pb-4 flex flex-col w-full max-w-230 mx-auto text-(--text-color)`}
                    >
                        <Outlet />
                    </div>
                )}
            </div>

            {!isHomepage && <Footer />}

            {gameData && (
                <MobileNavbar
                    toggleNav={toggleNav}
                    className={`${!navOpen ? "hidden" : "lg:fixed"}`}
                    navOpen={navOpen}
                />
            )}

            {gameData && (
                <NavBarOpenButton
                    className={
                        "lg:hidden sticky bottom-0 flex w-full justify-center border-t-4 border-(--outline) bg-(--red-brown)"
                    }
                    buttonClassName={"h-13 w-13"}
                    toggleNav={toggleNav}
                ></NavBarOpenButton>
            )}
        </div>
        </EditModeProvider>
    );
}
