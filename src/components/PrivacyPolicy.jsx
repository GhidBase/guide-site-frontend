import { useDarkMode } from "../contexts/ThemeProvider.jsx";

export default function PrivacyPolicy() {
    const { darkMode } = useDarkMode();

    const text = darkMode ? "rgba(255,235,200,0.75)" : "#3a2a1a";
    const heading = darkMode ? "rgba(255,235,200,0.95)" : "#1a0e06";
    const muted = darkMode ? "rgba(255,235,200,0.4)" : "#8a6a4a";

    return (
        <div className="max-w-3xl mx-auto px-4 py-10" style={{ color: text, fontFamily: "'Outfit', sans-serif" }}>
            <h1 style={{ color: heading, fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>Privacy Policy</h1>
            <p style={{ color: muted, fontSize: "0.8rem", marginBottom: "2rem" }}>Last updated: January 2025</p>

            <section className="mb-8">
                <h2 style={{ color: heading, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>What we collect</h2>
                <p className="mb-3">When you create an account, we collect your username and a hashed password. We do not collect your real name, phone number, or payment information.</p>
                <p>We may collect basic usage data (pages visited, time spent) to understand how the site is used and improve it.</p>
            </section>

            <section className="mb-8">
                <h2 style={{ color: heading, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>How we use it</h2>
                <p className="mb-3">Your account information is used to identify you on the site, attribute contributions to your username, and display your name on the leaderboard if you contribute.</p>
                <p>We do not sell, trade, or share your personal data with third parties for marketing purposes.</p>
            </section>

            <section className="mb-8">
                <h2 style={{ color: heading, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Cookies</h2>
                <p>We use cookies to keep you logged in across sessions. No advertising cookies are used.</p>
            </section>

            <section className="mb-8">
                <h2 style={{ color: heading, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Third-party services</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Google Analytics</strong> - used to understand site traffic. Subject to Google's privacy policy.</li>
                    <li><strong>Buy Me a Coffee</strong> - optional donation link. Any payment is handled by their platform.</li>
                    <li><strong>YouTube</strong> - embedded videos on some guide pages. Subject to YouTube's privacy policy.</li>
                    <li><strong>Discord</strong> - community links. Joining is optional and subject to Discord's privacy policy.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 style={{ color: heading, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Data retention</h2>
                <p>Your account data is retained as long as your account is active. You may request deletion of your account and associated data by contacting us.</p>
            </section>

            <section className="mb-8">
                <h2 style={{ color: heading, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Contact</h2>
                <p>Questions about this policy? Reach out via the Discord community linked in the footer of any game guide page.</p>
            </section>

            <p style={{ color: muted, fontSize: "0.75rem" }}>
                This site is not affiliated with or endorsed by the creators of any games featured here.
            </p>
        </div>
    );
}
