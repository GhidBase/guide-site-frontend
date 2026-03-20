import { useLoaderData, useNavigate } from "react-router";
import { useRef } from "react";

export default function MobileNavbarCategory({
    section,
    toggleNav,
    isOpen,
    onToggle,
}) {
    const title = section.title;
    const pages = [...section.pages].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    const linksRef = useRef(null);
    const { gameData, isLDG } = useLoaderData();
    const navigate = useNavigate();

    return (
        <div id="mobile-menu-category" className="mb-[8px] w-full ">
            <button
                id="mobile-menu-cat-header"
                className=" w-full text-left border-[2px] border-(--outline-brown) px-[12px] py-[10px] bg-(--primary) text-amber-50"
                onClick={onToggle}
            >
                {title} ({pages.length})
            </button>

            <div
                ref={linksRef}
                id="mobile-menu-links"
                className="border-[2px] border-t-0 border-(--outline-brown) overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    height: isOpen ? linksRef.current?.scrollHeight + "px" : "0px",
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
                        <button
                            key={page.id}
                            className="block w-full text-left px-[12px] py-[10px] border-t-[1px] border-(--outline-brown) text-(--text-color) cursor-pointer"
                            onClick={() => {
                                toggleNav(false);
                                setTimeout(() => {
                                    navigate(actualSlug, { viewTransition: true });
                                }, 250);
                            }}
                        >
                            {page.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
