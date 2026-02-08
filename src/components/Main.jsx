import "../css/tables.css";
import { Outlet, useLoaderData } from "react-router";
import Navbar from "./navbar/Navbar.jsx";
import Title from "./Title.jsx";
import NavBarOpenButton from "./NavBarOpenButton.jsx";
import { useEffect, useState } from "react";
import { usePageTracking } from "../hooks/usePageTracking.js";

export default function Main() {
    usePageTracking();
    const [navOpen, setNavOpen] = useState(false);
    const { gameData } = useLoaderData();

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
        <div
            id="main-page-sections"
            className="h-full w-full flex flex-col grow box-border custom-background"
        >
            <Title></Title>
            {
                // title is partially styled in tailwind.css
            }
            <div
                id="side-bar-and-content"
                className={`w-full box-border border-t-4 border-(--outline) flex flex-1
                bg-(--surface-background)
                ${gameData && "xl:pr-30 2xl:pr-60"} `}
            >
                {gameData && (
                    <Navbar
                        className={`
                            w-70 max-w-100 z-2 lg:h-full lg:w-fit lg:min-w-60
                            ${navOpen ? "fixed" : "hidden"} right-[50%] top-4 bottom-20 translate-x-1/2 lg:static lg:translate-0
                            border-4 border-(--outline) lg:border-t-0 lg:border-b-0 lg:border-l-0 lg:border-r-4
                            bg-(--primary)   
                            lg:flex lg:flex-col
                            overflow-y-auto`}
                        obstructorClassName={`z-1 ${navOpen ? "fixed" : "hidden"} top-0 w-full h-full bg-black/30`}
                        toggleNav={toggleNav}
                        navOpen={navOpen}
                        closeClassName={`
                            ${navOpen ? "fixed" : "hidden"}
                            w-70 max-w-100 bottom-4 h-16 z-2 right-[50%] translate-x-1/2
                            bg-(--primary) border-4 border-t-0 border-(--outline)`}
                    ></Navbar>
                )}
                <div
                    id="page-outer-bounds"
                    className={`gap-4 sm:px-4 pb-4 flex flex-col w-full max-w-230 mx-auto text-(--text-color)`}
                >
                    <Outlet />
                </div>
            </div>
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
    );
}
