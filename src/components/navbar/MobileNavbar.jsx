import { useState } from "react";
const isLDG = import.meta.env.VITE_LDG == "True";
import discordLogo from "../../assets/icons8-discord-50.png";
import MobileNavbarCategory from "./MobileNavbarCategory";
import { useLoaderData } from "react-router";

export default function MobileNavbar({ toggleNav, navOpen }) {
    console.log("navbar rendered");
    const { sectionsMap } = useLoaderData();
    const sections = Array.from(sectionsMap.values());
    const [openedSection, setOpenedSection] = useState(sections[0].id);

    return (
        <div
            className={`mobile-menu-overlay bg-black/40 w-full h-full fixed inset z-2   ${!navOpen ? "hidden" : " "} lg:hidden text-[0.8em]`}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    toggleNav();
                }
            }}
        >
            <div
                id="mobile-menu-panel"
                className="rounded-lg fixed inset-4 top-16 bottom-10 z-2 items-stretch flex flex-col justify-start bg-(--surface-background) border-(--outline-brown) border-[2px] shadow-lg shadow-black/50 "
            >
                <div
                    id="mobile-menu-header"
                    className=" w-full text-left border-b-[2px] px-[12px] py-[12px] flex gap-[8px] border-(--outline-brown) "
                >
                    <input
                        type="text"
                        className="flex w-full px-[12px] py-[12px] border-b-[2px] bg-(--primary) text-white border-(--outline-brown) border-[2px] "
                        placeholder="Search articles..."
                    />
                    <button
                        className="px-[12px] py-[12px] bg-(--primary) border-(--outline-brown) border-[2px] "
                        onClick={toggleNav}
                    >
                        Close
                    </button>
                </div>
                <div className="mobile-menu-feedback  "></div>
                <div
                    id="mobile-menu-categories"
                    className=" flex flex-col overflow-y-auto px-[12px] py-[8px] flex-1 "
                >
                    {sections.map((section) => {
                        return (
                            <MobileNavbarCategory
                                key={section.id}
                                toggleNav={toggleNav}
                                section={section}
                                openedSection={openedSection}
                                setOpenedSection={setOpenedSection}
                            />
                        );
                    })}
                </div>
                <div
                    id="mobile-menu-persistent"
                    className="flex flex-col items-center pt-2.5 pb-2 text-black px-3 border-t-[2px]  "
                >
                    <div className="flex items-center gap-2 ">
                        <p className="  ">Join the community: </p>
                        <a
                            href="https://discord.com/invite/luckydefense"
                            className="flex items-center justify-center gap-2 bg-[#5865f2] py-2 px-4 rounded-md "
                        >
                            <img src={discordLogo} className="h-[1.25em] " />
                            <p className="text-white text-[0.8em] ">Discord</p>
                        </a>
                    </div>
                    <div className="px-8 w-full my-2 ">
                        <hr className="w-full border-t border-black/50  " />
                    </div>
                    <div id="nav-footer" className=" text-[0.8em] text-center ">
                        © 2025 LuckyDefenseGuides.com. This site is not
                        affiliated with or endorsed by the creators of Lucky
                        Defense. |{" "}
                        <a
                            id="privacy-policy"
                            className=""
                            href="/pages/privacy-policy.html"
                        >
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
