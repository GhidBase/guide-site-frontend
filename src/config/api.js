// Client-side: route through the frontend proxy so cookies are first-party (fixes Safari ITP)
// Server-side: hit the backend directly (no browser cookie restrictions apply)
const currentAPI = typeof window !== "undefined"
    ? "/api"
    : import.meta.env.VITE_SERVER;

export { currentAPI };
