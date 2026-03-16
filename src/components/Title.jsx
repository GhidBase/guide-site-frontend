import ldgLogo from "../assets/LDG_Title.webp";
import { useMatches, useRouteLoaderData, useNavigate } from "react-router";
import { useEffect } from "react";
import { PanelTop } from "lucide-react";
import HorizontalNavbar from "./navbar/HorizontalNavbar";

export default function Title({ navbarLayout, toggleNavbarLayout }) {
    const navigate = useNavigate();
    const { pageData, pageSlug, gameData } = useRouteLoaderData("main");
    const matches = useMatches();
    const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;

    useEffect(() => {
        if (pageData?.notFound) navigate("/", { replace: true });
    }, [pageSlug]);

    const title = !!hardCodedTitle ? hardCodedTitle : pageData?.page?.title;
    const isLDGHomepage = title == "LD Homepage";

    if (navbarLayout === "horizontal" && gameData) {
        return (
            <div
                id="page-builder-title"
                className="title flex flex-col h-30 md:h-45 relative z-20"
            >
                <HorizontalNavbar toggleNavbarLayout={toggleNavbarLayout} />
            </div>
        );
    }

    return (
        <div
            id="page-builder-title"
            className="title relative flex items-center justify-center text-4xl md:text-7xl h-30 md:h-45"
        >
            {isLDGHomepage ? (
                <img src={ldgLogo} className="object-cover md:h-30 lg:h-35" alt="" />
            ) : (
                title
            )}
            {gameData && (
                <button
                    onClick={toggleNavbarLayout}
                    title="Switch to horizontal navbar"
                    className="hidden lg:flex absolute right-4 top-4 p-1.5 rounded border-2 border-amber-50/30 bg-amber-50/10 hover:bg-amber-50/20 text-amber-50 transition-colors items-center justify-center"
                >
                    <PanelTop className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
