import { useDarkMode } from "../contexts/ThemeProvider.jsx";

const LAST_UPDATED = "April 18, 2026";

function Section({ title, children }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold" style={{ opacity: 0.9 }}>{title}</h2>
            {children}
        </section>
    );
}

function P({ children }) {
    return <p className="text-sm leading-relaxed" style={{ opacity: 0.75 }}>{children}</p>;
}

function UL({ items }) {
    return (
        <ul className="flex flex-col gap-1.5 pl-4" style={{ opacity: 0.75 }}>
            {items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed list-disc">{item}</li>
            ))}
        </ul>
    );
}

export default function PrivacyPolicyPage() {
    const { darkMode } = useDarkMode();

    return (
        <div className="max-w-2xl mx-auto px-5 py-10 flex flex-col gap-8" style={{ viewTransitionName: "page-content" }}>
            {/* Header */}
            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-xs" style={{ opacity: 0.45 }}>Last updated: {LAST_UPDATED}</p>
            </div>

            <div
                className="rounded-xl border px-6 py-5"
                style={{
                    background: darkMode ? "rgba(255,235,200,0.04)" : "rgba(0,0,0,0.04)",
                    borderColor: darkMode ? "rgba(232,213,183,0.08)" : "rgba(0,0,0,0.1)",
                }}
            >
                <P>
                    This Privacy Policy explains what information is collected, how it is used, and how it is protected across GuideCodex and associated game guide sites (including luckydefenseguides.com). By using this site, you agree to the practices described below.
                </P>
            </div>

            <Section title="1. Information We Collect">
                <P>We collect the following types of information:</P>
                <UL items={[
                    "Account data: username, email address, and a securely hashed password when you register.",
                    "Profile data: profile picture (avatar) if you choose to upload one.",
                    "Usage data: pages you visit, search queries within the site, and general interaction patterns, collected to improve content and features.",
                    "Local preferences: theme settings, cursor preferences, and layout choices stored in your browser's localStorage. This data never leaves your device.",
                ]} />
            </Section>

            <Section title="2. How We Use Your Information">
                <P>We use your information solely to operate and improve the site:</P>
                <UL items={[
                    "Providing and personalising your experience (saved preferences, account features).",
                    "Enabling content contributions and edit-mode functionality for authorised users.",
                    "Understanding which guides and pages are most useful so we can improve them.",
                    "Communicating important updates related to your account if necessary.",
                ]} />
                <P>We do not sell, rent, or trade your personal information to any third party.</P>
            </Section>

            <Section title="3. Third-Party Services">
                <P>Our site links to or displays content from third-party services. These third parties operate under their own privacy policies and we are not responsible for their data practices:</P>
                <UL items={[
                    "Buy Me a Coffee: a voluntary support link. Clicking it takes you to their platform; no data is shared with them by us.",
                    "Discord: community links are provided for convenience. Joining a Discord server is entirely optional.",
                    "Google OAuth (optional): if you choose to sign in with Google, we receive only the minimum profile data (name, email, avatar) needed to create your account. We do not access your Google data beyond this.",
                ]} />
            </Section>

            <Section title="4. Cookies and Local Storage">
                <P>We use cookies only for session authentication (keeping you logged in). No advertising, tracking, or analytics cookies are set by us.</P>
                <P>Your theme, layout, and cursor preferences are stored in your browser's localStorage. You can clear this at any time via your browser settings without affecting your account.</P>
            </Section>

            <Section title="5. Data Retention">
                <P>Your account data is retained for as long as your account exists. If you wish to delete your account and associated data, contact us at the address below and we will process it promptly.</P>
                <P>Locally stored preferences are controlled entirely by you and can be cleared through your browser at any time.</P>
            </Section>

            <Section title="6. Contact Us">
                <P>If you have any questions about this Privacy Policy or wish to request deletion of your data, please reach out through the official GuideCodex Discord server.</P>
            </Section>

            <p className="text-xs text-center" style={{ opacity: 0.3 }}>© {new Date().getFullYear()} GuideCodex. All rights reserved.</p>
        </div>
    );
}
