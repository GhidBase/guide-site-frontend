export async function loader({ request }) {
    const hostname = new URL(request.url).hostname;
    if (!hostname.includes("luckydefenseguides")) {
        throw new Response(null, { status: 404 });
    }
    return new Response(
        "google.com, pub-7281531232813347, DIRECT, f08c47fec0942fa0",
        { headers: { "Content-Type": "text/plain" } },
    );
}

export default function AdsTxt() {
    return null;
}
