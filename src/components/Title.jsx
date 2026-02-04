import ldgLogo from "../assets/LDG_Title.webp";
import { useMatches, useRouteLoaderData, useNavigate } from "react-router";
import { useEffect } from "react";

export default function Title() {
    const navigate = useNavigate();
    const { pageData, pageSlug } = useRouteLoaderData("main");
    const matches = useMatches();
    const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;

    console.log(pageData);
    let title;
    useEffect(() => {
        if (pageData?.notFound) navigate("/", { replace: true });
    }, [pageSlug]);

    title = !!hardCodedTitle ? hardCodedTitle : pageData?.page?.title;
    /*
    useEffect(() => {
        if (!pageData?.notFound) {
            setTitle(!!hardCodedTitle ? hardCodedTitle : pageData?.page.title);
        } else {
            navigate("/404", { replace: true });
        }
    });
    */

    console.log(pageData);

    return (
        <div
            id="page-builder-title"
            className="title flex items-center justify-center text-4xl md:text-7xl h-30 md:h-45"
            // title is partially styled in tailwind.css
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
