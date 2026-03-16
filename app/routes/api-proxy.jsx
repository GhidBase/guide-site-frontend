const BACKEND = import.meta.env.VITE_SERVER;

async function proxy(request, params) {
    const path = params["*"];
    const url = new URL(request.url);
    const target = `${BACKEND}/${path}${url.search}`;

    const headers = new Headers(request.headers);
    headers.set("host", new URL(BACKEND).host);

    const res = await fetch(target, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer(),
    });

    const resHeaders = new Headers(res.headers);

    // Strip the domain from Set-Cookie so the browser stores it under guidecodex.com
    const cookies = res.headers.getSetCookie?.() ?? [];
    resHeaders.delete("set-cookie");
    for (const cookie of cookies) {
        resHeaders.append("set-cookie", cookie.replace(/;\s*domain=[^;]*/i, ""));
    }

    return new Response(res.body, { status: res.status, headers: resHeaders });
}

export const loader = ({ request, params }) => proxy(request, params);
export const action = ({ request, params }) => proxy(request, params);
