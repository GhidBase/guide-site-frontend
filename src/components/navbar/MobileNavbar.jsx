const isLDG = import.meta.env.VITE_LDG == "True";
import { Link } from "react-router";

export default function Navbar({}) {
    console.log("navbar rendered");

    return (
        <div className="mobile-menu-overlay">
            <div
                id="mobile-menu-panel"
                className="fixed inset-4 bg-black z-2 items-stretch flex flex-col justify-start "
            >
                <div
                    id="mobile-menu-header"
                    className="bg-white w-full text-left border-[2px] px-[10px] py-[12px] flex gap-[8px]"
                >
                    <input
                        type="text"
                        className="flex w-full px-[10px] py-[12px] border-b-[2px] bg-black"
                    />
                    <button className="px-[10px] py-[12px] border-b-[2px] bg-black border-black">
                        Close
                    </button>
                </div>
                <div className="mobile-menu-feedback bg-white"></div>
                <div
                    id="mobile-menu-categories"
                    className="bg-gray-500 flex flex-col overflow-y-auto px-[12px] py-[8px] flex-1 "
                >
                    <div
                        id="mobile-menu-category"
                        className="mb-[8px] bg-black w-full "
                    >
                        <button
                            id="mobile-menu-cat-header"
                            className=" w-full text-left bg-black border-[2px] border-white px-[12px] py-[10px] "
                        >
                            test
                        </button>
                        <div
                            id="mobile-menu-links "
                            className="border-[2px] border-t-0  "
                        >
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-red-500 "
                            >
                                test
                            </Link>
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-red-500  "
                            >
                                test
                            </Link>
                        </div>
                    </div>
                    <div
                        id="mobile-menu-category"
                        className="mb-[8px] bg-black w-full "
                    >
                        <button
                            id="mobile-menu-cat-header"
                            className=" w-full text-left bg-black border-[2px] border-white px-[12px] py-[10px] "
                        >
                            test
                        </button>
                        <div
                            id="mobile-menu-links "
                            className="border-[2px] border-t-0  "
                        >
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-red-500 "
                            >
                                test
                            </Link>
                            <Link
                                to="mythic-categories"
                                className="block px-[12px] py-[10px] border-t-[1px] border-red-500  "
                            >
                                test
                            </Link>
                        </div>
                    </div>
                </div>
                <div
                    id="mobile-menu-persistent"
                    className="flex flex-col items-center py-3 "
                >
                    <a href="https://discord.com/invite/luckydefense">
                        Discord
                    </a>
                    <div className="px-8 w-full my-3 ">
                        <hr className="w-full border-t border-white/50  " />
                    </div>
                    <div id="nav-footer" className="text-[0.8em] text-center ">
                        © 2025 LuckyDefenseGuides.com. This site is not
                        affiliated with or endorsed by the creators of Lucky
                        Defense.
                    </div>
                    <div className="px-8 w-full my-3  ">
                        <hr className="w-full border-t border-white/50 " />
                    </div>
                    <a
                        id="privacy-policy"
                        className="text-[0.8em] "
                        href="/pages/privacy-policy.html"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
}
