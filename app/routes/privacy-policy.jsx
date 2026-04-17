import PrivacyPolicyPage from "../../src/components/PrivacyPolicyPage";

export function meta() {
    return [
        { title: "Privacy Policy | GuideCodex" },
        { name: "description", content: "How GuideCodex collects, uses, and protects your information." },
    ];
}

export default function PrivacyPolicy() {
    return <PrivacyPolicyPage />;
}
