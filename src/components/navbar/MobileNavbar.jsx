const isLDG = import.meta.env.VITE_LDG == "True";

export default function Navbar({}) {
    console.log("navbar rendered");

    return (
        <div className="mobile-menu-overlay">
            <div
                id="mobile-menu-panel"
                className="fixed inset-4 bg-black z-2 items-center justify-center"
            >
                <div className="mobile-menu-header bg-white flex items-center ">
                    <div className="w-full text-left border-[2px] px-[10px] py-[12px] flex gap-[8px]">
                        <input
                            type="text"
                            className="flex w-full px-[10px] py-[12px] border-b-[2px] bg-black"
                        />
                        <button className="px-[10px] py-[12px] border-b-[2px] bg-black border-black">
                            Close
                        </button>
                    </div>
                </div>
                <div className="mobile-menu-feedback bg-white"></div>
                <div className="mobile-menu-categories bg-white"></div>
            </div>
        </div>
    );
}
