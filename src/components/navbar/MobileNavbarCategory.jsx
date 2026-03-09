import { Link } from "react-router";

export default function MobileNavbarCategory({ section, toggleNav }) {
    const title = section.title;
    const pages = section.pages;
    const isLDG = import.meta.env.VITE_LDG == "True";
    return (
        <div id="mobile-menu-category" className="mb-[8px] w-full ">
            <button
                id="mobile-menu-cat-header"
                className=" w-full text-left border-[2px] border-(--outline-brown) px-[12px] py-[10px] bg-(--primary) "
            >
                {title}
            </button>
            <div
                id="mobile-menu-links "
                className="border-[2px] border-t-0 border-(--outline-brown) "
            >
                {pages.map((page) => {
                    var actualSlug;
                    if (isLDG) {
                        actualSlug = "/" + page.slug;
                    } else {
                        actualSlug =
                            "/games/" + gameData.slug + "/" + page.slug;
                    }
                    console.log(actualSlug);
                    return (
                        <Link
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
