import { describe, it, expect } from "vitest";

// Mirrors the exact logic used in TopBar, MobileBottomBar, HorizontalNavbar
function canEdit({ role, isAuthenticated, isPerGameEditor }) {
    const isAdmin = role === "ADMIN";
    const isGlobalEditor = role === "EDITOR";
    return isAdmin || isGlobalEditor || isPerGameEditor;
}

// Mirrors ProtectedRoute role hierarchy
const roles = { USER: 0, EDITOR: 1, ADMIN: 2 };
function hasAccess(userRole, requiredRole) {
    return (roles[userRole] ?? -1) >= (roles[requiredRole] ?? 0);
}

describe("edit mode visibility", () => {
    it("admin can edit", () => {
        expect(canEdit({ role: "ADMIN", isAuthenticated: true, isPerGameEditor: false })).toBe(true);
    });

    it("global editor can edit", () => {
        expect(canEdit({ role: "EDITOR", isAuthenticated: true, isPerGameEditor: false })).toBe(true);
    });

    it("per-game editor can edit", () => {
        expect(canEdit({ role: "USER", isAuthenticated: true, isPerGameEditor: true })).toBe(true);
    });

    it("regular user cannot edit", () => {
        expect(canEdit({ role: "USER", isAuthenticated: true, isPerGameEditor: false })).toBe(false);
    });

    it("guest cannot edit", () => {
        expect(canEdit({ role: undefined, isAuthenticated: false, isPerGameEditor: false })).toBe(false);
    });
});

describe("protected route access", () => {
    it("admin passes all role checks", () => {
        expect(hasAccess("ADMIN", "ADMIN")).toBe(true);
        expect(hasAccess("ADMIN", "EDITOR")).toBe(true);
        expect(hasAccess("ADMIN", "USER")).toBe(true);
    });

    it("global editor passes editor and user checks", () => {
        expect(hasAccess("EDITOR", "EDITOR")).toBe(true);
        expect(hasAccess("EDITOR", "USER")).toBe(true);
        expect(hasAccess("EDITOR", "ADMIN")).toBe(false);
    });

    it("user only passes user check", () => {
        expect(hasAccess("USER", "USER")).toBe(true);
        expect(hasAccess("USER", "EDITOR")).toBe(false);
        expect(hasAccess("USER", "ADMIN")).toBe(false);
    });

    it("guest fails all checks", () => {
        expect(hasAccess(undefined, "USER")).toBe(false);
        expect(hasAccess(undefined, "EDITOR")).toBe(false);
        expect(hasAccess(undefined, "ADMIN")).toBe(false);
    });
});

describe("per-game editor scope", () => {
    it("per-game editor cannot access admin-only routes", () => {
        expect(hasAccess("USER", "ADMIN")).toBe(false);
    });

    it("per-game editor with USER role gets edit toggle only when assigned", () => {
        expect(canEdit({ role: "USER", isAuthenticated: true, isPerGameEditor: true })).toBe(true);
        expect(canEdit({ role: "USER", isAuthenticated: true, isPerGameEditor: false })).toBe(false);
    });

    it("global editor does not need per-game assignment", () => {
        expect(canEdit({ role: "EDITOR", isAuthenticated: true, isPerGameEditor: false })).toBe(true);
    });
});
