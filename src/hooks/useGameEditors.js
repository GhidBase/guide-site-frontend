import { useState, useEffect, useCallback } from "react";
import { currentAPI } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

export function useGameEditors(gameId) {
    const { user } = useAuth();
    const [editors, setEditors] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchEditors = useCallback(async () => {
        if (!gameId) return;
        setLoading(true);
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/editors`, { credentials: "include" });
            if (res.ok) setEditors(await res.json());
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => { fetchEditors(); }, [fetchEditors]);

    const isGameEditor = !!user && editors.some((e) => e.id === user.id);

    async function grantEditor(userId) {
        const res = await fetch(`${currentAPI}/games/${gameId}/editors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error("Failed to grant editor");
        await fetchEditors();
    }

    async function revokeEditor(userId) {
        const res = await fetch(`${currentAPI}/games/${gameId}/editors/${userId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to revoke editor");
        setEditors((prev) => prev.filter((e) => e.id !== userId));
    }

    return { editors, loading, isGameEditor, grantEditor, revokeEditor, refetch: fetchEditors };
}
