import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { currentAPI } from "../config/api.js";

const GoogleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function SignupPage() {
    const navigate = useNavigate();
    const { signup, isLoading, error, isAuthenticated } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [adminSecret, setAdminSecret] = useState("");
    const [showAdminSecret, setShowAdminSecret] = useState(false);
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated]);

    async function handleSubmit(e) {
        e.preventDefault();
        setLocalError(null);

        if (password !== passwordConfirm) {
            setLocalError("Passwords do not match");
            return;
        }

        const success = await signup(username, password, adminSecret);

        if (success) {
            navigate("/");
        }
    }

    return (
        <div className="w-full max-w-md mx-auto mt-8 px-4 flex flex-col">
            <div className="bg-(--surface-background) border-2 border-(--primary) rounded p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {(error || localError) && (
                        <div className="p-3 bg-red-900/30 border border-red-700 rounded text-(--text-color) text-sm">
                            {error || localError}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
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

                    <div className="flex flex-col gap-2">
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

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="passwordConfirm"
                            className="text-(--text-color) font-semibold text-sm"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="passwordConfirm"
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            disabled={isLoading}
                            required
                            className="px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div className="mt-4 pt-4 border-t border-(--primary)">
                        <button
                            type="button"
                            onClick={() => setShowAdminSecret(!showAdminSecret)}
                            className="text-(--primary) font-semibold hover:underline cursor-pointer text-sm"
                        >
                            {showAdminSecret ? "Hide" : "Register as Admin"}
                        </button>

                        {showAdminSecret && (
                            <div className="flex flex-col gap-2 mt-3">
                                <label
                                    htmlFor="adminSecret"
                                    className="text-(--text-color) font-semibold text-sm"
                                >
                                    Admin Secret
                                </label>
                                <input
                                    id="adminSecret"
                                    type="password"
                                    value={adminSecret}
                                    onChange={(e) =>
                                        setAdminSecret(e.target.value)
                                    }
                                    disabled={isLoading}
                                    className="px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-6 px-4 py-2 bg-(--primary) text-amber-50 rounded font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-(--primary) flex flex-col gap-3">
                    <a
                        href={`${currentAPI}/auth/google`}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded border border-(--primary) text-(--text-color) text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ background: "rgba(255,255,255,0.03)", textDecoration: "none" }}
                    >
                        <GoogleIcon />
                        Sign up with Google
                    </a>
                    <p className="text-center text-(--text-color) text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-(--primary) font-semibold hover:underline cursor-pointer">
                            Login
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
