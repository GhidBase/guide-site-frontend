import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error, isAuthenticated } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated]);

    async function handleSubmit(e) {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate("/");
        }
    }

    return (
        <div className="max-w-md w-full mx-auto mt-8 px-4 flex flex-col">
            <div className="bg-(--surface-background) border-2 border-(--primary) rounded-lg p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-700 rounded text-(--text-color) text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <label
                            htmlFor="username"
                            className="text-(--text-color) font-semibold text-sm"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            required
                            className="px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <label
                            htmlFor="password"
                            className="text-(--text-color) font-semibold text-sm"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            className="px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-6 px-4 py-2 bg-(--primary) text-amber-50 rounded font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-(--primary) text-center text-(--text-color) text-sm">
                    <p>
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-(--primary) font-semibold hover:underline cursor-pointer"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
            <Link className="text-center mt-2 self-center" to="/">
                Back to GuideCodex
            </Link>
        </div>
    );
}
