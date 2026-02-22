import { Link } from "react-router";

export default function AccessDeniedPage() {
    return (
        <div className="w-full max-w-md mx-auto mt-20 px-4 text-center">
            <h1 className="text-4xl font-bold text-(--text-color) mb-4">
                Access Denied
            </h1>
            <p className="text-(--text-color) mb-6">
                You don't have permission to access this page.
            </p>
            <Link
                to="/"
                className="inline-block px-4 py-2 bg-(--primary) text-amber-50 rounded font-semibold cursor-pointer hover:opacity-90"
            >
                Back to Home
            </Link>
        </div>
    );
}
