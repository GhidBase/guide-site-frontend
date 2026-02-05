import NavbarButton from "./NavbarButton";
import { Fragment, useEffect, useState } from "react";
import NavbarSection from "./NavbarSection";
import { getNavbarMap, onHydrateNavbar } from "@/stores/navbarStore";

const env = import.meta.env.VITE_ENV;

export default function Navbar({
    className,
    obstructorClassName,
    toggleNav,
    navOpen,
    closeClassName,
}) {
    const [, forceRender] = useState(0);
    
    useEffect(() => {
        const unsubscribe = onHydrateNavbar(() => {
            forceRender(x => x + 1);
        });
        
        return unsubscribe;
    }, []);
    
    const navbarMap = getNavbarMap();
    
    // Convert map to array and flatten sections with their pages
    const navbarItems = [];
    
    // Add dev-only pages at the start
    if (env === "DEV") {
        navbarItems.push(
            { id: "nav-panel", slug: "/navigation-panel", navbarTitle: "Navigation Panel", type: "page" },
            { id: "page-mgr", slug: "/page-manager", navbarTitle: "Page Manager", type: "page" }
        );
    }
    
    // Add sections and their pages from the map
    Array.from(navbarMap.values()).forEach(section => {
        // Add section header
        navbarItems.push({
            id: section.id,
            navbarTitle: section.title,
            type: "section"
        });
        
        // Add pages under this section
        section.pages.forEach(page => {
            navbarItems.push({
                id: page.id,
                slug: page.slug,
                navbarTitle: page.title,
                type: "page"
            });
        });
    });

    return (
        <Fragment>
            <div id="nav-bar" className={className}>
                {navbarItems.map((item, index, arr) => {
                    if (item.type === "page") {
                        return (
                            <NavbarButton
                                slug={item.slug}
                                navbarTitle={item.navbarTitle}
                                key={item.id}
                                className={`
                                    w-full h-20
                                    flex items-center justify-center
                                    lg:h-15 lg:border-b-4 border-(--outline)
                                    ${index < arr.length - 1 && "border-b-4"}`}
                                toggleNav={toggleNav}
                            />
                        );
                    }
                    if (item.type === "section") {
                        return (
                            <NavbarSection
                                navbarTitle={item.navbarTitle}
                                key={item.id}
                                className={`
                                    w-full h-15
                                    text-2xl font-bold underline
                                    flex items-center justify-center
                                    bg-(--surface-background) text-(--text-color) lg:border-b-4 border-(--outline)
                                    ${index < arr.length - 1 && "border-b-4"}`}
                            />
                        );
                    }
                })}
            </div>
            <button onClick={toggleNav} className={closeClassName}>
                Close
            </button>
            <div
                id="navbar-obstructor"
                onClick={toggleNav}
                className={obstructorClassName}
            ></div>
        </Fragment>
    );
}