---
name: Hosting platform
description: Where the frontend is deployed and how it's served
type: project
---

Frontend is deployed on **Render** as a Node.js server (not Apache static). React Router v7 SSR runs server-side with a real Node process.

**Why:** User switched from Hostinger/Apache static to Render for proper SSR.

**How to apply:** Don't suggest static file workarounds or .htaccess solutions. The SSR server handles all routes including loaders that return custom Response objects (like ads.txt). `public/.htaccess` and `vercel.json` are leftover artifacts from the old static deployment.
