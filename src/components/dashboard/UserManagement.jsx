import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePage } from "../../hooks/usePage";

export default function UserManagement() {
    const { currentAPI } = usePage();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [currentAPI]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const response = await fetch(`${currentAPI}/users`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleRoleChange(userId, newRole) {
        try {
            setActionLoading(userId);
            const response = await fetch(`${currentAPI}/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ newRole }),
            });

            if (!response.ok) {
                throw new Error("Failed to update user role");
            }

            const data = await response.json();
            const updatedUser = data.user || data;
            setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) {
        return <div className="text-(--text-color)">Loading users...</div>;
    }

    if (error) {
        return (
            <div className="p-3 bg-(--primary)/20 border border-(--primary) rounded text-(--text-color)">
                {error}
            </div>
        );
    }

    if (users.length === 0) {
        return <div className="text-(--text-color)">No users found</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b-2 border-(--primary)">
                        <th className="text-left p-3 text-(--text-color) font-semibold">
                            Username
                        </th>
                        <th className="text-left p-3 text-(--text-color) font-semibold">
                            Current Role
                        </th>
                        <th className="text-left p-3 text-(--text-color) font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr
                            key={u.id}
                            className="border-b border-(--primary)/30 hover:bg-(--primary)/10 transition-colors"
                        >
                            <td className="p-3 text-(--text-color)">
                                {u.username}
                            </td>
                            <td className="p-3 text-(--text-color)">
                                {u.role}
                            </td>
                            <td className="p-3">
                                <div className="flex gap-2">
                                    {u.role !== "ADMIN" && (
                                        <button
                                            onClick={() =>
                                                handleRoleChange(u.id, "ADMIN")
                                            }
                                            disabled={actionLoading === u.id}
                                            className="px-3 py-1 bg-(--primary) text-amber-50 rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90"
                                        >
                                            Make Admin
                                        </button>
                                    )}
                                    {u.role !== "EDITOR" && (
                                        <button
                                            onClick={() =>
                                                handleRoleChange(u.id, "EDITOR")
                                            }
                                            disabled={actionLoading === u.id}
                                            className="px-3 py-1 bg-(--primary) text-amber-50 rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90"
                                        >
                                            Make Editor
                                        </button>
                                    )}
                                    {u.role !== "USER" && (
                                        <button
                                            onClick={() =>
                                                handleRoleChange(u.id, "USER")
                                            }
                                            disabled={actionLoading === u.id}
                                            className="px-3 py-1 bg-(--primary) text-amber-50 rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90"
                                        >
                                            Make User
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
