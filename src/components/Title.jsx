import ldgLogo from "../assets/LDG_Title.webp";
import { useMatches, useRouteLoaderData, useNavigate } from "react-router";
import { useEffect } from "react";
import SearchBar from "./SearchBar";

export default function Title() {
    const navigate = useNavigate();
    const { pageData, pageSlug, sectionsMap } = useRouteLoaderData("main");
    const matches = useMatches();
    const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;

    let title;
    useEffect(() => {
        if (pageData?.notFound) navigate("/", { replace: true });
    }, [pageSlug]);

    title = !!hardCodedTitle ? hardCodedTitle : pageData?.page?.title;
    const isLDGHomepage = title == "LD Homepage";

    return (
        <div
            id="page-builder-title"
            className="title flex flex-col items-center justify-center gap-3 min-h-30 md:min-h-45 py-4"
            // title is partially styled in tailwind.css
        >
            <div className="text-4xl md:text-7xl">
                {isLDGHomepage ? (
                    <img
                        src={ldgLogo}
                        className=" object-cover md:h-30 lg:h-35"
                        alt=""
                    />
                ) : (
                    title
                )}
            </div>
            {sectionsMap && <SearchBar />}
        </div>
    );
}
