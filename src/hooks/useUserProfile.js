import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { currentAPI } from "../config/api.js";
import { saveOrbSettings, ORB_DEFAULT } from "../components/OrbTrail.jsx";

export function useUserProfile() {
    const { isAuthenticated } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) { setAvatarUrl(null); return; }
        fetch(`${currentAPI}/users/me`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .then(p => {
                if (!p) return;
                if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
                // Hydrate orb settings from server so it persists across devices
                if (p.orbSettings) saveOrbSettings({ ...ORB_DEFAULT, ...p.orbSettings });
            })
            .catch(() => {});
    }, [isAuthenticated]);

    return { avatarUrl, setAvatarUrl };
}
