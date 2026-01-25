import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { usePage } from "../hooks/usePage";

export function AuthProvider({ children }) {
    const { currentAPI } = usePage();
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function checkSession() {
            try {
                setLoading(true);
                const response = await fetch(`${currentAPI}/user`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setIsAuthenticated(true);
                    setError(null);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (err) {
                console.error("Session check failed:", err);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, [currentAPI]);

    async function signup(username, password, adminSecret = null) {
        try {
            setLoading(true);
            setError(null);

            const body = {
                username,
                password,
                ...(adminSecret && { adminSecret }),
            };

            const response = await fetch(`${currentAPI}/sign-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.errors?.[0]?.msg || "Signup Failed");
                return false;
            }

            const userResponse = await fetch(`${currentAPI}/user`, {
                method: "GET",
                credentials: "include",
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData);
                setIsAuthenticated(true);
            }

            return true;
        } catch (err) {
            setError(err.message || "Signup Error");
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function login(username, password) {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${currentAPI}/log-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.errors?.[0]?.msg || "Login Failed");
                return false;
            }

            const userResponse = await fetch(`${currentAPI}/user`, {
                method: "GET",
                credentials: "include",
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setError("Failed to fetch user data");
                return false;
            }

            return true;
        } catch (err) {
            setError(err.message || "Login Error");
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        try {
            setLoading(true);
            await fetch(`${currentAPI}/log-out`, {
                method: "GET",
                credentials: "include",
            });

            setUser(null);
            setIsAuthenticated(false);
            setError(null);
        } catch (err) {
            console.error("Logout Error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                error,
                signup,
                login,
                logout,
                setError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
