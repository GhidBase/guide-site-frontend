const isLDG = import.meta.env.VITE_LDG == "True";
import { Link } from "react-router";
import discordLogo from "../../assets/icons8-discord-50.png";

export default function Navbar({}) {
    console.log("navbar rendered");

    return (
        <div className="mobile-menu-overlay">
            <div
                id="mobile-menu-panel"
                className="fixed inset-4 z-2 items-stretch flex flex-col justify-start bg-(--surface-background) border-(--outline-brown) border-[2px] "
            >
                <div
                    id="mobile-menu-header"
                    className=" w-full text-left border-b-[2px] px-[10px] py-[12px] flex gap-[8px] border-(--outline-brown) "
                >
                    <input
                        type="text"
                        className="flex w-full px-[10px] py-[12px] border-b-[2px] bg-(--primary) text-white border-(--outline-brown) border-[2px] "
                        placeholder="Search articles..."
                    />
                    <button className="px-[10px] py-[12px] bg-(--primary) border-(--outline-brown) border-[2px]  ">
                        Close
                    </button>
                </div>
                <div className="mobile-menu-feedback  "></div>
                <div
                    id="mobile-menu-categories"
                    className=" flex flex-col overflow-y-auto px-[12px] py-[8px] flex-1 "
                >
                    <div id="mobile-menu-category" className="mb-[8px] w-full ">
                        <button
                            id="mobile-menu-cat-header"
                            className=" w-full text-left border-[2px] border-(--outline-brown) px-[12px] py-[10px] bg-(--primary) "
                        >
                            test
                        </button>
                        <div
                            id="mobile-menu-links "
                            className="border-[2px] border-t-0 border-(--outline-brown) "
                        >
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-(--outline-brown) text-black "
                            >
                                test
                            </Link>
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-(--outline-brown) text-black "
                            >
                                test
                            </Link>
                        </div>
                    </div>
                    <div id="mobile-menu-category" className="mb-[8px] w-full ">
                        <button
                            id="mobile-menu-cat-header"
                            className=" w-full text-left border-[2px] border-(--outline-brown) px-[12px] py-[10px] bg-(--primary) "
                        >
                            test
                        </button>
                        <div
                            id="mobile-menu-links "
                            className="border-[2px] border-t-0 border-(--outline-brown) "
                        >
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-(--outline-brown) text-black "
                            >
                                test
                            </Link>
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-(--outline-brown) text-black "
                            >
                                test
                            </Link>
                        </div>
                    </div>
                </div>
                <div
                    id="mobile-menu-persistent"
                    className="flex flex-col items-center pt-2.5 pb-2 text-black px-3 border-t-[2px]  "
                >
                    <div className="flex items-center gap-2 ">
                        <p className=" text-[0.8em] ">Join the community: </p>
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
                    <div id="nav-footer" className="text-[0.6em] text-center ">
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
