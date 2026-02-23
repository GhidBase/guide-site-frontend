import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

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

                <div className="mt-6 pt-6 border-t border-(--primary) text-center text-(--text-color) text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-(--primary) font-semibold hover:underline cursor-pointer"
                    >
                        Login
                    </Link>
                </div>
            </div>
            <Link className="text-center mt-2 self-center" to="/">
                Back to GuideCodex
            </Link>
        </div>
    );
}
