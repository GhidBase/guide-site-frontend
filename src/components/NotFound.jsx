import { Link } from "react-router";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-(--text-color)">
            <h1 className="text-6xl font-bold opacity-30">404</h1>
            <p className="text-lg font-medium">This page doesn't exist.</p>
            <Link
                to="/"
                className="mt-2 px-4 py-2 bg-(--primary) text-amber-50 rounded font-medium hover:opacity-90 transition-opacity"
            >
                Back to GuideCodex
            </Link>
        </div>
    );
}
