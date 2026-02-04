import { useMatches } from "react-router";
import ldgLogo from "../assets/LDG_Title.webp";
import { useRouteLoaderData } from "react-router";
const isLDG = import.meta.env.VITE_LDG;

export default function Title() {
    const { pageData } = useRouteLoaderData("main");
    const matches = useMatches();
    const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;

    const title = !!hardCodedTitle ? hardCodedTitle : pageData?.page.title;

    return (
        <div
            id="page-builder-title"
            className="title flex items-center justify-center text-4xl md:text-7xl"
        >
            {title == "LD Homepage" ? (
                <img
                    src={ldgLogo}
                    className=" object-cover md:h-30 lg:h-35"
                    alt=""
                />
            ) : (
                title
            )}
        </div>
    );
}
