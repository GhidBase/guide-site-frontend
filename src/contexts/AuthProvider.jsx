import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { currentAPI } from "@/config/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function checkSession() {
            setIsLoading(true);
            try {
                const res = await fetch(`${currentAPI}/user`, {
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setIsAuthenticated(true);
                    setError(null);
                }
            } catch (err) {
                setError(err);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkSession();
    }, []);

    async function signup(username, password, adminSecret = null) {
        setIsLoading(true);
        setError(null);

        const body = {
            username,
            password,
            ...(adminSecret && { adminSecret }),
        };

        try {
            const res = await fetch(`${currentAPI}/sign-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.errors?.[0]?.msg || "Signup Failed");
                return false;
            }

            const userRes = await fetch(`${currentAPI}/user`, {
                credentials: "include",
            });

            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);
                setIsAuthenticated(true);
            }

            return true;
        } catch (err) {
            setError(err?.message || "Signup Error");
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function login(username, password) {
        setIsLoading(true);
        setError(null);

        const body = {
            username,
            password,
        };

        try {
            const res = await fetch(`${currentAPI}/log-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.errors?.[0]?.message || "Login Failed");
                return false;
            }

            const userRes = await fetch(`${currentAPI}/user`, {
                credentials: "include",
            });

            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setError("Failed to fetch user data");
                return false;
            }
            return true;
        } catch (err) {
            setError(err?.message || "Login Error");
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        setIsLoading(true);
        try {
            await fetch(`${currentAPI}/log-out`, {
                credentials: "include",
            });

            setUser(null);
            setIsAuthenticated(false);
            setError(null);
            return true;
        } catch (err) {
            console.error("Logout Error: ", err);
        } finally {
            setIsLoading(false);
            return true;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                error,
                signup,
                login,
                logout,
                setError,
                currentAPI,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
