import { Link } from "react-router";
import { useRef } from "react";

export default function MobileNavbarCategory({
    section,
    toggleNav,
    openedSection,
    setOpenedSection,
}) {
    const title = section.title;
    const pages = section.pages;
    const linksRef = useRef(null);
    const isLDG = import.meta.env.VITE_LDG == "True";
    return (
        <div id="mobile-menu-category" className="mb-[8px] w-full ">
            <button
                id="mobile-menu-cat-header"
                className=" w-full text-left border-[2px] border-(--outline-brown) px-[12px] py-[10px] bg-(--primary) "
                onClick={() => {
                    console.log(linksRef.current.scrollHeight);
                    setOpenedSection(section.id);
                }}
            >
                {title} ({pages.length})
            </button>

            <div
                ref={linksRef}
                id="mobile-menu-links"
                className="border-[2px] border-t-0 border-(--outline-brown) overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    height:
                        openedSection === section.id
                            ? linksRef.current?.scrollHeight + "px"
                            : "0px",
                }}
            >
                {pages.map((page) => {
                    var actualSlug;
                    if (isLDG) {
                        actualSlug = "/" + page.slug;
                    } else {
                        actualSlug =
                            "/games/" + gameData.slug + "/" + page.slug;
                    }
                    return (
                        <Link
                            key={page.id}
                            className="block px-[12px] py-[10px] border-t-[1px] border-(--outline-brown) text-black "
                            to={page.slug}
                            onClick={toggleNav}
                        >
                            {page.title}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
