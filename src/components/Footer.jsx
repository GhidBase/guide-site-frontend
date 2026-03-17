import { useRouteLoaderData } from "react-router";

export default function Footer() {
    const { gameData, isLDG } = useRouteLoaderData("main");

    const siteName = isLDG ? "LuckyDefenseGuides.com" : "GuideCodex";
    const gameName = gameData?.title ?? "this game";

    return (
        <footer className="w-full border-t-4 border-(--outline) bg-(--primary) px-4 py-3">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 text-center text-xs text-amber-50/80 flex-wrap">
                <span>
                    © {new Date().getFullYear()} {siteName}. This site is not affiliated with or endorsed by the creators of {gameName}.
                </span>
                <span className="hidden sm:inline mx-2">|</span>
                <a
                    href="https://guidecodex.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-50 underline underline-offset-2"
                >
                    GuideCodex
                </a>
                <span className="hidden sm:inline mx-2">|</span>
                <a
                    href="/privacy-policy"
                    className="hover:text-amber-50 underline underline-offset-2"
                >
                    Privacy Policy
                </a>
                {gameData?.showSupportButton !== false && (
                    <>
                        <span className="hidden sm:inline mx-2">|</span>
                        <a
                            href="https://buymeacoffee.com/ghidward"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 rounded border border-amber-50/40 bg-amber-50/10 hover:bg-amber-50/20 text-amber-50 font-medium transition-colors"
                        >
                            <img
                                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                                alt="Buy me a coffee"
                                className="w-4 h-4"
                            />
                            Support the Developer
                        </a>
                    </>
                )}
            </div>
        </footer>
    );
}
