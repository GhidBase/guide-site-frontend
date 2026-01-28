const serverAPI = "https://guide-site-backend.onrender.com";
const localAPI = "http://localhost:3000";
const currentAPI =
    import.meta.env.VITE_SERVER == "LOCAL" ? localAPI : serverAPI;

export { serverAPI, localAPI, currentAPI };
