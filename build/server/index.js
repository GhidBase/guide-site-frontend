import { jsx, jsxs, Fragment as Fragment$1 } from "react/jsx-runtime";
import { renderToReadableStream } from "react-dom/server";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts, redirect, useLoaderData, Link, useNavigate, useRouteLoaderData, useMatches, useLocation } from "react-router";
import { createContext, useState, useEffect, useContext, Fragment, useRef, lazy, Suspense } from "react";
import { PencilIcon, Check, X, Clock, Palette, ChevronDown, ChevronRight, Trash, Info } from "lucide-react";
async function handleRequest(request, responseStatusCode, responseHeaders, routerContext) {
  const body = await renderToReadableStream(
    /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
    {
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      }
    }
  );
  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const AuthContext = createContext(null);
const currentAPI = "https://api.luckydefenseguides.com";
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function checkSession() {
      setIsLoading(true);
      try {
        const res = await fetch(`${currentAPI}/user`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (err) {
        setError(err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);
  async function signup(username, password, adminSecret = null) {
    setIsLoading(true);
    setError(null);
    const body = {
      username,
      password,
      ...adminSecret && { adminSecret }
    };
    try {
      const res = await fetch(`${currentAPI}/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        credentials: "include"
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.[0]?.msg || "Signup Failed");
        return false;
      }
      const userRes = await fetch(`${currentAPI}/user`, {
        credentials: "include"
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        setIsAuthenticated(true);
      }
      return true;
    } catch (err) {
      setError(err?.message || "Signup Error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  async function login(username, password) {
    setIsLoading(true);
    setError(null);
    const body = {
      username,
      password
    };
    try {
      const res = await fetch(`${currentAPI}/log-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0]?.message || "Login Failed");
        return false;
      }
      const userRes = await fetch(`${currentAPI}/user`, {
        credentials: "include"
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setError("Failed to fetch user data");
        return false;
      }
      return true;
    } catch (err) {
      setError(err?.message || "Login Error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  async function logout() {
    setIsLoading(true);
    try {
      await fetch(`${currentAPI}/log-out`, {
        credentials: "include"
      });
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      return true;
    } catch (err) {
      console.error("Logout Error: ", err);
    } finally {
      setIsLoading(false);
      return true;
    }
  }
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        isAuthenticated,
        isLoading,
        error,
        signup,
        login,
        logout,
        setError,
        currentAPI
      },
      children
    }
  );
}
const ThemeContext = createContext({ theme: null, setTheme: () => {
} });
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, setTheme }, children });
}
function useTheme() {
  return useContext(ThemeContext);
}
const THEME_DEFAULTS = {
  primary: "#794e3b",
  secondary: "#845744",
  accent: "#f0e3c3",
  surfaceBackground: "#d1bc9f",
  outline: "#352b22",
  textColor: "#604f45",
  accentText: "#3a2a1a"
};
const THEME_FIELDS = [
  { key: "primary", label: "Primary", description: "Buttons, navbar, header" },
  { key: "secondary", label: "Secondary", description: "Background stripe" },
  { key: "surfaceBackground", label: "Surface", description: "Main content area" },
  { key: "accent", label: "Accent", description: "Cards and panels" },
  { key: "outline", label: "Borders", description: "Lines and borders" },
  { key: "textColor", label: "Text", description: "General text" },
  { key: "accentText", label: "Accent Text", description: "Text on cards" }
];
function themeToStyle(theme) {
  if (!theme) return {};
  return {
    "--red-brown": theme.primary,
    "--primary": theme.primary,
    "--khaki-brown": theme.secondary,
    "--secondary": theme.secondary,
    "--accent": theme.accent,
    "--surface-background": theme.surfaceBackground,
    "--outline-brown": theme.outline,
    "--outline": theme.outline,
    "--text-color": theme.textColor,
    "--accent-text": theme.accentText
  };
}
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "UTF-8"
      }), /* @__PURE__ */ jsx("link", {
        rel: "icon",
        type: "image/png",
        href: "/LDG_Logo.png"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {}), /* @__PURE__ */ jsx("script", {
        async: true,
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7281531232813347",
        crossOrigin: "anonymous"
      }), /* @__PURE__ */ jsx("script", {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-X8KBQ5CE84"
      }), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-X8KBQ5CE84');`
        }
      })]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function Root() {
  return /* @__PURE__ */ jsx(AuthProvider, {
    children: /* @__PURE__ */ jsx(ThemeProvider, {
      children: /* @__PURE__ */ jsx(Outlet, {})
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const redirectMap = {
  "stun-guide.html": "/stun-guide",
  "defense-reduction.html": "/defense-reduction",
  "sb-mg.html": "/sb-mg",
  "mythic-roles.html": "/mythic-categories",
  "mpregen.html": "/mp-regen",
  "atkspeed.html": "/attack-speed",
  "helpiamnew-quests.html": "/newbie-quests",
  "hell-mode-guide.html": "/hell-mode-basics",
  "hell-mode-gameplay-guide.html": "/hell-mode",
  "hell-mode-bosses.html": "/hell-mode-bosses",
  "magic-hell-build.html": "/magic-hell-build",
  "treasures.html": "/exclusive-treasures",
  "treasure-upgrade-costs.html": "/treasure-upgrade-costs",
  "how-to-upgrade-treasures.html": "/unlock-treasures",
  "safe-box-earnings.html": "/safe-box-table",
  "pet-list.html": "/pets",
  "daily-fortunes.html": "/daily-fortunes",
  "indy-treasures.html": "/indy-treasures",
  "unlock-order.html": "/unlock-order-hard",
  "immortal-guardians.html": "/immortal-guardians",
  "guardian-upgrade-costs.html": "/guardian-upgrade-costs"
};
function loader({
  params
}) {
  const destination = redirectMap[params.page];
  if (destination) {
    return redirect(destination, 301);
  }
  return redirect("/404", 301);
}
const oldPages = UNSAFE_withComponentProps(function OldPages() {
  return null;
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: oldPages,
  loader
}, Symbol.toStringTag, { value: "Module" }));
async function gameAndPageLoader({ params, request }) {
  const { gameSlug, pageSlug } = params;
  async function safeFetch(url) {
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.json();
  }
  async function fetchPageBySlug() {
    let path = currentAPI;
    if (!gameData && !!pageSlug) {
      path = path + "/pages/by-slug/" + pageSlug;
    } else if (!!gameData && !!pageSlug) {
      path = path + "/games/" + gameData.id + "/pages/by-slug/" + pageSlug;
    }
    const result = await safeFetch(path);
    return result;
  }
  async function fetchGameHomepage() {
    const response = await fetch(
      currentAPI + "/games/" + gameData.id + "/pages/by-slug/" + gameData.slug
    );
    const result = await response.json();
    return result;
  }
  async function fetchGameBySlug(gameSlug2) {
    const response = await fetch(currentAPI + "/games/by-slug/" + gameSlug2);
    if (response == null || response == void 0) {
      return;
    }
    const result = await response.json();
    return result;
  }
  async function fetchNavbar() {
    if (!gameData) {
      return;
    }
    const res = await fetch(
      currentAPI + "/sections/navbar?gameId=" + gameData.id
    );
    const data = await res.json();
    const navbarMap2 = /* @__PURE__ */ new Map();
    data.forEach((section) => {
      navbarMap2.set(section.id, section);
    });
    return navbarMap2;
  }
  let gameData;
  let pageData;
  {
    gameData = await fetchGameBySlug("lucky-defense");
    if (!!pageSlug) {
      pageData = await fetchPageBySlug();
    }
    if (!!gameData && !pageSlug) {
      pageData = await fetchGameHomepage();
    }
  }
  if (!pageData) {
    throw redirect("/");
  }
  const sectionsMap = await fetchNavbar();
  const origin = new URL(request.url).origin;
  return { gameData, pageData, gameSlug, pageSlug, sectionsMap, origin };
}
function NavbarButton({
  slug,
  navbarTitle,
  className,
  toggleNav,
  navbarEditMode,
  nonEditable,
  buttonData
}) {
  const { gameData } = useLoaderData();
  var actualSlug;
  {
    actualSlug = "/" + slug;
  }
  const [editMode, setEditMode] = useState(false);
  const [inputText, setInputText] = useState(navbarTitle);
  function toggleEditMode() {
    setEditMode(!editMode);
    setInputText(navbarTitle);
  }
  if (navbarEditMode && !nonEditable) {
    return /* @__PURE__ */ jsx("div", { className, children: !editMode ? /* @__PURE__ */ jsxs("div", { className: "flex w-full px-2 mb-0.5 ", children: [
      /* @__PURE__ */ jsx("p", { className: "flex-1", children: navbarTitle }),
      /* @__PURE__ */ jsx(
        PencilIcon,
        {
          className: " cursor-pointer",
          onClick: () => toggleEditMode()
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex w-full h-full items-center ", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          value: inputText,
          onChange: (e) => setInputText(e.target.value),
          className: "min-w-0 flex-1 h-full py-1 px-2 "
        }
      ),
      inputText != navbarTitle && /* @__PURE__ */ jsx(
        Check,
        {
          onClick: () => toggleEditMode(),
          className: "h-10 w-10 cursor-pointer "
        }
      ),
      " ",
      /* @__PURE__ */ jsx(
        X,
        {
          onClick: () => toggleEditMode(),
          className: "h-10 w-10 cursor-pointer "
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsx(
    Link,
    {
      className,
      to: actualSlug,
      onClick: () => toggleNav(false),
      children: navbarTitle
    }
  );
}
function NavbarSection({
  navbarTitle,
  className,
  navbarEditMode,
  id
}) {
  if (navbarEditMode) {
    return /* @__PURE__ */ jsxs("div", { className, id: "nav-section-editview-" + id, children: [
      /* @__PURE__ */ jsx("h1", { children: navbarTitle }),
      /* @__PURE__ */ jsx(PencilIcon, { className: "ml-2" })
    ] });
  } else {
    return /* @__PURE__ */ jsx("h1", { className, children: navbarTitle });
  }
}
function NavbarEditButton({
  toggleEditMode,
  className,
  navbarEditMode
}) {
  if (!navbarEditMode) {
    return /* @__PURE__ */ jsx("button", { className, onClick: toggleEditMode, children: "Edit Nav" });
  }
  return /* @__PURE__ */ jsxs("button", { className, onClick: toggleEditMode, children: [
    "Finish Nav Edit",
    /* @__PURE__ */ jsx(Check, { className: "ml-2" })
  ] });
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
function Navbar({
  className,
  obstructorClassName,
  toggleNav,
  closeClassName
}) {
  const { gameData, sectionsMap } = useLoaderData();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const isAdmin = user?.role == "ADMIN";
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const navbarItems = [];
  function toggleEditMode() {
    setEditMode(!editMode);
  }
  async function handleLogout() {
    await logout();
    toggleNav(false);
  }
  if (isAuthenticated && isAdmin) {
    navbarItems.push(
      {
        id: "nav-panel",
        slug: "navigation-panel",
        navbarTitle: "Navigation Panel",
        type: "page",
        nonEditable: true
      },
      {
        id: "page-mgr",
        slug: "page-manager",
        navbarTitle: "Page Manager",
        type: "page",
        nonEditable: true
      },
      {
        //id: "edit-nav",
        //type: "edit-button",
        //navbarTitle: "Edit Navbar",
        //nonEditable: true,
      }
    );
  }
  if (gameData.title == "Lucky Defense") {
    navbarItems.push({
      id: 32,
      slug: "immortal-guardians",
      navbarTitle: "Immortal Guardians",
      type: "page"
    });
  }
  {
    Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order).forEach((section, index) => {
      if (index != 0 && gameData.title == "Lucky Defense" || gameData.title != "Lucky Defense") {
        navbarItems.push({
          id: section.id,
          navbarTitle: section.title,
          type: "section"
        });
      }
      section.pages.forEach((page) => {
        navbarItems.push({
          id: page.id,
          slug: page.slug,
          navbarTitle: page.title,
          type: "page"
        });
      });
    });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { id: "nav-bar", className, children: [
      /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col", children: !isLoading && /* @__PURE__ */ jsx("div", { className: "w-full border-b-4 border-(--outline)", children: isAuthenticated ? /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col p-4 bg-(--surface-background)", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xl text-(--text-color) text-center font-semibold mb-3", children: user?.username }),
        isAdmin && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              navigate("/dashboard");
              toggleNav(false);
            },
            className: "w-full text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm mb-2",
            children: "Dashboard"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleLogout,
            className: "w-full text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm",
            children: "Logout"
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "w-full flex gap-2 p-4 bg-(--surface-background)", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/login",
            onClick: () => toggleNav(false),
            className: "flex-1 text-center text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm",
            children: "Log In"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/signup",
            onClick: () => toggleNav(false),
            className: "flex-1 text-center text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm",
            children: "Sign Up"
          }
        )
      ] }) }) }),
      navbarItems.map((item, index, arr) => {
        if (item.type === "page") {
          return /* @__PURE__ */ jsx(
            NavbarButton,
            {
              slug: item.slug,
              navbarEditMode: editMode,
              nonEditable: item.nonEditable,
              navbarTitle: item.navbarTitle,
              buttonData: item,
              className: `
                                    w-full h-20
                                    flex items-center justify-center
                                    lg:h-15 lg:border-b-4 border-(--outline)
                                    ${index < arr.length - 1 && "border-b-4"}
                                    text-center
                                    `,
              toggleNav
            },
            item.id
          );
        }
        if (item.type === "section") {
          return /* @__PURE__ */ jsx(
            NavbarSection,
            {
              navbarTitle: item.navbarTitle,
              navbarEditMode: editMode,
              id: item.id,
              nonEditable: item.nonEditable,
              className: `
                                    w-full h-15
                                    text-2xl font-bold underline
                                    flex items-center justify-center
                                    bg-(--surface-background) text-(--text-color) lg:border-b-4 border-(--outline)
                                    ${index < arr.length - 1 && "border-b-4"}`
            },
            item.id
          );
        }
        if (item.type === "edit-button") {
          return /* @__PURE__ */ jsx(
            NavbarEditButton,
            {
              toggleEditMode,
              navbarEditMode: editMode,
              navbarTitle: item.navbarTitle,
              nonEditable: item.nonEditable,
              buttonData: item,
              className: `
                                    w-full h-20
                                    cursor-pointer
                                    flex items-center justify-center
                                    lg:h-15 lg:border-b-4 border-(--outline)
                                    ${index < arr.length - 1 && "border-b-4"}`
            },
            item.id
          );
        }
      })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: toggleNav, className: closeClassName + " hidden", children: "Close" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        id: "navbar-obstructor",
        onClick: toggleNav,
        className: obstructorClassName + " lg:hidden"
      }
    )
  ] });
}
const ldgLogo = "/assets/LDG_Title-BcHWm7db.webp";
function Title() {
  const navigate = useNavigate();
  const { pageData, pageSlug } = useRouteLoaderData("main");
  const matches = useMatches();
  const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;
  let title;
  useEffect(() => {
    if (pageData?.notFound) navigate("/", { replace: true });
  }, [pageSlug]);
  title = !!hardCodedTitle ? hardCodedTitle : pageData?.page?.title;
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "page-builder-title",
      className: "title flex items-center justify-center text-4xl md:text-7xl h-30 md:h-45",
      children: title == "LD Homepage" ? /* @__PURE__ */ jsx(
        "img",
        {
          src: ldgLogo,
          className: " object-cover md:h-30 lg:h-35",
          alt: ""
        }
      ) : title
    }
  );
}
const menuIcon = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%3e%3cpath%20d='M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z'%20/%3e%3c/svg%3e";
function NavBarOpenButton({
  className,
  buttonClassName,
  toggleNav
}) {
  return /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsx("img", { className: buttonClassName, src: menuIcon, alt: "", onClick: toggleNav }) });
}
const discordLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC/klEQVR4nO2Yy29MURzH25LxSJqohjZq3VAlqHQhUV0RURUsasVCSLoTknokNuIPwLBqI/GIBQkiFUvPGCQdDBKa0OggRFVQYlAfOfKb5PT23Ofcae7E/SQ3mdw5v+/vfO899zx+ZWUxMTExMaUEUA/sALqBNPAFuA6Ue4gtB65JTFo0lFb9RHW+DjgA9DOWHHAbOAJUedCZARyWGBWr81xy1BXDwGzgGPBDS6h+nwU2AJUFaFeKhtKy6h9XucMy0Qa81xIMA3uBaku7RmAbkAR6gafS9rdcw3KvV9qotgssGtWirdrmUbnbCjWxHPipiSb1oQMsk6c2SHAG5W03abpVck9/O81BTUySJ5jnF5CQ/1YD9wmfe8AqyZGQN5nnAVARxMgWQyI109yk+NwCbhjudwQxkiF6pP2aaCG6NPsxcpro0uPVxFTgM9HlEzDFi5GNRJ91XoycIfqcdDNRYVnFo8o7x80psJTSYZGTkT0BBO8Ai9UHCCwBUkWKsbLbychl/PEwv23RNNTW4lHIMSYuOBl5SwizB7A+5BgTWTsTc/GP8awAzAo5xo45JqF2/FNj06makGPsGH9OAXbhn/YAwyRIjB07TULqgOQXuw83E3KMHUmTkasEIyXrj9qjNQF3ixRj4orJyBNKj4zJyCtKjwGTkY8OAX/kzDw6gZ0clUVS5bZjyGTEWijT6ZY2Kw3FuWLQD7RKzh6HdjmTkT6HgMdArbSbLOXNbBEMZIHtKofkqnX5dvtMRuYDIw5BH6Sy8m/7LBu+TcAllzg3vgIX5UCX0GrDW9XQcYmbN86ICKz10Ck133foNSZZB1qBLuCETK8vpCM5uYbkXkradMlQTVhqaZs9rCnKxBqjCU1MzesDHp7ka+AosCJQ4WzsYa5FtN54yPtSrUFexacDh4BvHoS/Aw0FGGkQDTfUSDkITAuSRBWV90up347OoCa0PJ0O+s+AfcDMQvPkky1UmzTgvMzvI65FAH/6p0RTaZ+TXI1h6cfExMTExPwX/AUSwnsiWoemtQAAAABJRU5ErkJggg==";
function MobileNavbarCategory({
  section,
  toggleNav,
  openedSection,
  setOpenedSection
}) {
  const title = section.title;
  const pages = section.pages;
  const linksRef = useRef(null);
  const { gameData, sectionsMap } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", { id: "mobile-menu-category", className: "mb-[8px] w-full ", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        id: "mobile-menu-cat-header",
        className: " w-full text-left border-[2px] border-(--outline-brown) px-[12px] py-[10px] bg-(--primary) ",
        onClick: () => {
          console.log(linksRef.current.scrollHeight);
          setOpenedSection(section.id);
        },
        children: [
          title,
          " (",
          pages.length,
          ")"
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: linksRef,
        id: "mobile-menu-links",
        className: "border-[2px] border-t-0 border-(--outline-brown) overflow-hidden transition-all duration-300 ease-in-out",
        style: {
          height: openedSection === section.id ? linksRef.current?.scrollHeight + "px" : "0px"
        },
        children: pages.map((page) => {
          var actualSlug;
          {
            actualSlug = "/" + page.slug;
          }
          return /* @__PURE__ */ jsx(
            Link,
            {
              className: "block px-[12px] py-[10px] border-t-[1px] border-(--outline-brown) text-black ",
              to: actualSlug,
              onClick: toggleNav,
              children: page.title
            },
            page.id
          );
        })
      }
    )
  ] });
}
function MobileNavbar({ toggleNav, navOpen }) {
  console.log("navbar rendered");
  const { gameData, sectionsMap } = useLoaderData();
  const sections = Array.from(sectionsMap.values());
  const [openedSection, setOpenedSection] = useState(sections[0].id);
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const isAdmin = user?.role == "ADMIN";
  const navigate = useNavigate();
  const navbarItems = [];
  if (isAuthenticated && isAdmin) {
    navbarItems.push(
      {
        id: "nav-panel",
        title: "Navigation Panel",
        slug: "navigation-panel"
      },
      {
        id: "page-mgr",
        title: "Page Manager",
        slug: "page-manager"
      }
    );
  }
  if (gameData.title == "Lucky Defense") {
    navbarItems.push({
      id: 32,
      slug: "immortal-guardians",
      title: "Immortal Guardians"
    });
  }
  const actualSections = sections.map((section) => ({
    ...section,
    pages: [...section.pages]
  }));
  actualSections[0].pages = [...navbarItems, ...actualSections[0].pages];
  async function handleLogout() {
    await logout();
    toggleNav(false);
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `mobile-menu-overlay bg-black/40 w-full h-full fixed inset z-2  ${navOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-all lg:hidden text-[0.8em] duration-250 `,
      onClick: (e) => {
        if (e.target === e.currentTarget) {
          toggleNav();
        }
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          id: "mobile-menu-panel",
          className: `rounded-lg
                    fixed inset-4 top-16 bottom-16 z-2
                    items-stretch flex flex-col justify-start
                    bg-(--surface-background) border-(--outline-brown) border-[2px] shadow-lg shadow-black/50
                    transition-all duration-200
                    ${navOpen ? "translate-y-0" : "translate-y-full"} `,
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                id: "mobile-menu-header",
                className: " w-full text-left border-b-[2px] px-[12px] flex gap-[8px] border-(--outline-brown) ",
                children: isAuthenticated ? /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col pt-3 bg-(--surface-background)", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xl text-(--text-color) text-center font-semibold mb-3", children: user?.username }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    isAdmin && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => {
                          navigate("/dashboard");
                          toggleNav(false);
                        },
                        className: "w-full text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm mb-2 h-8 ",
                        children: "Dashboard"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: handleLogout,
                        className: "w-full text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm h-8  ",
                        children: "Logout"
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "w-full flex gap-2 p-4 bg-(--surface-background)", children: [
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      to: "/login",
                      onClick: () => toggleNav(false),
                      className: "flex-1 text-center text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm",
                      children: "Log In"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      to: "/signup",
                      onClick: () => toggleNav(false),
                      className: "flex-1 text-center text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm",
                      children: "Sign Up"
                    }
                  )
                ] })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "mobile-menu-feedback  " }),
            /* @__PURE__ */ jsx(
              "div",
              {
                id: "mobile-menu-categories",
                className: " flex flex-col overflow-y-auto px-[12px] py-[8px] flex-1 ",
                children: actualSections.map((section) => {
                  return /* @__PURE__ */ jsx(
                    MobileNavbarCategory,
                    {
                      toggleNav,
                      section,
                      openedSection,
                      setOpenedSection
                    },
                    section.id
                  );
                })
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                id: "mobile-menu-persistent",
                className: "flex flex-col items-center pt-2.5 pb-2 text-black px-3 border-t-[2px]  ",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ", children: [
                    /* @__PURE__ */ jsx("p", { className: "  ", children: "Join the community: " }),
                    /* @__PURE__ */ jsxs(
                      "a",
                      {
                        href: "https://discord.com/invite/luckydefense",
                        className: "flex items-center justify-center gap-2 bg-[#5865f2] py-2 px-4 rounded-md ",
                        children: [
                          /* @__PURE__ */ jsx("img", { src: discordLogo, className: "h-[1.25em] " }),
                          /* @__PURE__ */ jsx("p", { className: "text-white text-[0.8em] ", children: "Discord" })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "px-8 w-full my-2 ", children: /* @__PURE__ */ jsx("hr", { className: "w-full border-t border-black/50  " }) }),
                  /* @__PURE__ */ jsxs("div", { id: "nav-footer", className: " text-[0.8em] text-center ", children: [
                    "© 2025 LuckyDefenseGuides.com. This site is not affiliated with or endorsed by the creators of Lucky Defense. |",
                    " ",
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        id: "privacy-policy",
                        className: "",
                        href: "/pages/privacy-policy.html",
                        children: "Privacy Policy"
                      }
                    )
                  ] })
                ]
              }
            )
          ]
        }
      )
    }
  );
}
function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    if (!window.gtag) return;
    window.gtag("config", "G-X8KBQ5CE84", {
      page_path: location.pathname + location.search
    });
  }, [location.pathname, location.search]);
}
function Main() {
  usePageTracking();
  const [navOpen, setNavOpen] = useState(false);
  const { gameData } = useLoaderData();
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setTheme(gameData?.theme ?? null);
  }, [gameData?.id]);
  function toggleNav(state) {
    if (typeof state == "boolean") {
      setNavOpen(state);
    } else {
      setNavOpen(!navOpen);
    }
  }
  useEffect(() => {
    if (navOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      const scrollY = Math.abs(
        parseInt(document.body.style.top || "0", 10)
      );
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    }
  }, [navOpen]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: "main-page-sections",
      className: "h-full w-full flex flex-col grow box-border custom-background",
      style: themeToStyle(theme),
      children: [
        /* @__PURE__ */ jsx(Title, {}),
        /* @__PURE__ */ jsxs(
          "div",
          {
            id: "side-bar-and-content",
            className: `w-full box-border border-t-4 border-(--outline) flex flex-1
                bg-(--surface-background)
                ${gameData && "xl:pr-30 2xl:pr-60"} `,
            children: [
              gameData && /* @__PURE__ */ jsx(
                Navbar,
                {
                  className: `
                            w-60 max-w-60 min-w-60 z-3 lg:h-full
                            ${navOpen ? "fixed" : "hidden"} right-[50%] top-4 bottom-20 translate-x-1/2 lg:static lg:translate-0
                            hidden lg:fixed
                            border-4 border-(--outline) lg:border-t-0 lg:border-b-0 lg:border-l-0 lg:border-r-4
                            bg-(--primary)   
                            lg:flex lg:flex-col
                            overflow-y-auto`,
                  obstructorClassName: `z-1 ${navOpen ? "fixed" : "hidden"} top-0 w-full h-full bg-black/30`,
                  toggleNav,
                  navOpen,
                  closeClassName: `
                            ${navOpen ? "fixed" : "hidden"}
                            w-60 max-w-100 bottom-4 h-16 z-2 right-[50%] translate-x-1/2
                            bg-(--primary) border-4 border-t-0 border-(--outline)`
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  id: "page-outer-bounds",
                  className: `gap-4 sm:px-4 pb-4 flex flex-col w-full max-w-230 mx-auto text-(--text-color)`,
                  children: /* @__PURE__ */ jsx(Outlet, {})
                }
              )
            ]
          }
        ),
        gameData && /* @__PURE__ */ jsx(
          MobileNavbar,
          {
            toggleNav,
            className: `${!navOpen ? "hidden" : "lg:fixed"}`,
            navOpen
          }
        ),
        gameData && /* @__PURE__ */ jsx(
          NavBarOpenButton,
          {
            className: "lg:hidden sticky bottom-0 flex w-full justify-center border-t-4 border-(--outline) bg-(--red-brown)",
            buttonClassName: "h-13 w-13",
            toggleNav
          }
        )
      ]
    }
  );
}
const SITE_NAME = "Lucky Defense Guides";
const SITE_DESCRIPTION = "Your ultimate resource for mastering normal, hard, and hell mode. Find everything you need to progress quickly—from in-depth gameplay mechanics and strategy guides to tools like Board Builders, Upgrade Calculators, and Gacha Simulators to help you choose between 1x and 10x pulls. Whether you're just starting out or pushing endgame content, we've got you covered.";
const OG_IMAGE = "/LDG_Logo.png";
function meta({
  data,
  location
}) {
  const pageTitle = data?.pageData?.page?.title;
  const isHomepage = !pageTitle || pageTitle === "LD Homepage";
  const title = isHomepage ? SITE_NAME : `${pageTitle} | ${SITE_NAME}`;
  const base = "https://luckydefenseguides.com";
  const ogImage = `${base}${OG_IMAGE}`;
  const ogUrl = `${base}${location.pathname}`;
  return [{
    title
  }, {
    name: "description",
    content: SITE_DESCRIPTION
  }, {
    property: "og:site_name",
    content: SITE_NAME
  }, {
    property: "og:title",
    content: title
  }, {
    property: "og:description",
    content: SITE_DESCRIPTION
  }, {
    property: "og:type",
    content: "website"
  }, {
    property: "og:image",
    content: ogImage
  }, {
    property: "og:url",
    content: ogUrl
  }, {
    name: "twitter:card",
    content: "summary"
  }, {
    name: "twitter:title",
    content: title
  }, {
    name: "twitter:description",
    content: SITE_DESCRIPTION
  }];
}
function shouldRevalidate({
  currentParams,
  nextParams
}) {
  return currentParams.gameSlug !== nextParams.gameSlug || currentParams.pageSlug !== nextParams.pageSlug;
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Main,
  loader: gameAndPageLoader,
  meta,
  shouldRevalidate
}, Symbol.toStringTag, { value: "Module" }));
const TextEditor = lazy(() => import("./assets/TextEditor-BdER837H.js"));
function TextBlock({
  deleteBlock,
  block,
  updateBlockWithEditorData,
  adminMode,
  addBlock
}) {
  const editorRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  let content;
  if (block && block.content && block.content.content) {
    content = block.content.content;
  }
  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.offsetHeight);
    }
  }, [content, adminMode]);
  function toggleEditorMode() {
    setEditMode(!editMode);
  }
  function checkDeletion() {
    const confirmedDelete = window.confirm(
      "Are you sure you want to delete this block?"
    );
    if (confirmedDelete) {
      deleteBlock();
    }
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: "text-block-" + block.id,
      className: `relative content-block bg-(--surface-background) w-full text-(--text-color) ${adminMode && "border-b border-(--primary) mb-0 bg-black/3 md:rounded "}`,
      children: [
        adminMode && /* @__PURE__ */ jsx(
          "div",
          {
            id: "text-block-header-" + block.id,
            className: "sticky top-7\n                h-10\n                bg-(--accent)\n                border-b border-t sm:border border-(--outline-brown)/50 rounded-t\n                flex justify-center items-center\n                text-xl z-1 ",
            children: "Text Block"
          }
        ),
        editMode && /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(
          TextEditor,
          {
            height,
            editorRef,
            content
          }
        ) }),
        !editMode && /* @__PURE__ */ jsx(
          "div",
          {
            id: "text-content-" + block.id,
            ref: contentRef,
            className: `text-left px-8 py-1` + (adminMode && ` bg-(--accent) border-x border-(--outline-brown)/50 `),
            dangerouslySetInnerHTML: { __html: content }
          }
        ),
        adminMode && /* @__PURE__ */ jsxs(
          "div",
          {
            id: "lower-buttons",
            className: " py-1.5\n                    sticky bottom-14 lg:bottom-0\n                    divide-x divide-x-reverse divide-(--outline-brown)/25\n                    border-t border-(--outline-brown)/50 sm:border-x\n                    flex flex-row-reverse\n                    w-full justify-between\n                    h-10\n                    rounded-b\n                    bg-(--accent)",
            children: [
              editMode && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: async () => {
                    await updateBlockWithEditorData(
                      block,
                      editorRef
                    );
                    toggleEditorMode();
                  },
                  className: "flex items-center justify-center w-full h-full text-center",
                  children: "Save"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => toggleEditorMode(),
                  className: "flex items-center justify-center w-full h-full text-center",
                  children: [
                    !editMode && "Edit",
                    editMode && "Cancel"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: checkDeletion,
                  className: "text-red-700/70\n                        flex items-center justify-center text-center \n                        w-full h-full ",
                  children: "Delete"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function PendingReviewNotification({ visible, onDismiss }) {
  const [isVisible, setIsVisible] = useState(visible);
  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, 5e3);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);
  if (!isVisible) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 right-6 z-50 animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 bg-(--primary) text-amber-50 rounded shadow-lg border border-(--primary)/50 backdrop-blur-sm", children: [
    /* @__PURE__ */ jsx(Clock, { size: 20, className: "shrink-0" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start leading-0 gap-y-1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-base font-semibold leading-none m-0 p-0 block", children: "Your review is pending" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm opacity-90 leading-none mt-2 p-0 block", children: "Changes submitted for review" })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setIsVisible(false);
          if (onDismiss) {
            onDismiss();
          }
        },
        className: "ml-2 cursor-pointer hover:opacity-80",
        children: /* @__PURE__ */ jsx(X, { size: 18 })
      }
    )
  ] }) });
}
function SingleImageBlock({
  deleteBlock,
  block,
  refreshBlock,
  adminMode
}) {
  const { gameData } = useRouteLoaderData("main");
  const gameId = gameData?.id;
  const currentAPIgames = currentAPI + "/games/" + gameId;
  const [stagedFiles, setStagedFiles] = useState(["No File Chosen"]);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const blockHasFiles = !!block.files;
  async function deleteAllFiles() {
    if (block.isUnsaved) {
      deleteBlock(block);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        currentAPIgames + "/blocks/" + block.id + "/files",
        {
          method: "Delete",
          credentials: "include"
        }
      );
      if (response.status === 202) {
        setShowNotification(true);
      } else if (!response.ok) {
        console.error("delete all files failed");
      }
      refreshBlock(block.id);
      deleteBlock(block);
    } finally {
      setLoading(false);
    }
  }
  async function uploadFile(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target);
      const response = await fetch(
        currentAPIgames + "/blocks/" + block.id + "/files",
        {
          method: "POST",
          body: formData,
          credentials: "include"
        }
      );
      if (response.status === 202) {
        setShowNotification(true);
      } else if (!response.ok) {
        console.error("upload failed");
        return;
      }
      e.target.reset();
      setStagedFiles(["No File Chosen"]);
      refreshBlock(block.id);
    } finally {
      setLoading(false);
    }
  }
  async function deleteFileById(id) {
    try {
      setLoading(true);
      const response = await fetch(currentAPIgames + "/files/" + id, {
        method: "Delete",
        credentials: "include"
      });
      if (response.status === 202) {
        setShowNotification(true);
      } else if (!response.ok) {
        console.error("delete specific file failed");
      }
      refreshBlock(block.id);
    } finally {
      setLoading(false);
    }
  }
  let imgUrls = [];
  if (blockHasFiles) {
    imgUrls = block.files.map(
      (v) => typeof v.url === "string" ? v.url : void 0
    );
  }
  let showFileText = imgUrls[0] == void 0 || stagedFiles[0] != "No File Chosen";
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `text-(--text-color) mt-2 ${adminMode && "bg-black/10 border-b border-(--primary) mb-0"}`,
        id: "image-block-" + block.id,
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-stretch", children: block.files && block.files.map((file) => {
            return /* @__PURE__ */ jsxs(
              "div",
              {
                id: file.id,
                className: "w-full m-auto",
                children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      id: "photo-img-" + file.id,
                      src: file.url,
                      alt: "",
                      className: "max-h-80 mx-auto"
                    }
                  ),
                  adminMode && /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
                      onClick: () => deleteFileById(file.id),
                      disabled: loading,
                      children: "Delete"
                    }
                  )
                ]
              },
              file.id
            );
          }) }),
          adminMode && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "form",
              {
                onSubmit: uploadFile,
                method: "post",
                encType: "multipart/form-data",
                className: `flex flex-col`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "label",
                    {
                      className: "text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7 cursor-pointer hover:opacity-90",
                      htmlFor: "upload-file" + block.id,
                      children: "Choose a file"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "hidden",
                      name: "id",
                      value: "<%= folder.id %>"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "file",
                      name: "upload-file" + block.id,
                      id: "upload-file" + block.id,
                      className: "hidden",
                      onChange: (e) => {
                        const file = e.target.files?.[0];
                        const newFiles = [...stagedFiles];
                        newFiles[0] = file ? file.name : "No file chosen";
                        setStagedFiles(newFiles);
                      },
                      disabled: loading
                    }
                  ),
                  showFileText && /* @__PURE__ */ jsx(
                    "p",
                    {
                      className: `${stagedFiles[0] != "No File Chosen" && "px-3"}`,
                      children: stagedFiles[0]
                    }
                  ),
                  stagedFiles[0] != "No File Chosen" && /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
                      type: "submit",
                      disabled: loading,
                      children: "Upload"
                    }
                  )
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                id: "lower-buttons",
                className: "flex gap-2 m-2 justify-center",
                children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => deleteAllFiles(),
                    className: "text-amber-50 bg-red-700 rounded px-3 py-1 font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
                    disabled: loading,
                    children: "Delete All"
                  }
                )
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      PendingReviewNotification,
      {
        visible: showNotification,
        onDismiss: () => setShowNotification(false)
      }
    )
  ] });
}
function PageBuilder() {
  const { pageData, gameData } = useRouteLoaderData("main");
  gameData?.slug;
  const gameId = gameData?.id;
  const { user, isAuthenticated } = useAuth();
  const [blocks, setBlocks] = useState(pageData?.blocks ?? []);
  const isAdmin = user?.role == "ADMIN";
  const [adminMode, setAdminMode] = useState(false);
  const pageId = pageData?.page?.id;
  const pageManagerSlug = "/page-manager";
  useEffect(() => {
    setBlocks(pageData?.blocks ?? []);
  }, [gameData]);
  const orders = blocks.map((block) => block.order ? block.order : 0);
  const highestOrder = Math.max(...orders);
  function isOrderTaken(order) {
    return blocks.find((block) => block.order == order) != void 0;
  }
  async function addBlock({ nextOrder = highestOrder + 1, type } = {}) {
    console.log("adding block");
    console.log(
      currentAPI + "/games/" + gameId + "/pages/by-id/" + pageId + "/blocks"
    );
    const orderTaken = isOrderTaken(nextOrder);
    if (orderTaken) {
      await shiftBlocks(nextOrder);
    }
    const response = await fetch(
      currentAPI + "/games/" + gameId + "/pages/by-id/" + pageId + "/blocks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ order: nextOrder, type }),
        credentials: "include"
      }
    );
    const newBlock = await response.json();
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
  }
  async function shiftBlocks(order) {
    const response = await fetch(
      currentAPI + "/games/" + gameId + "/pages/by-id/" + pageId + "/blocks",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ type: "offset", order })
      }
    );
    if (!response.ok) {
      throw new Error("Request failed");
    }
    blocks.map((block) => {
      if (block.order >= order) {
        block.order++;
      }
      return block;
    });
    return;
  }
  async function deleteBlock(block) {
    console.log(gameId);
    const response = await fetch(
      currentAPI + "/games/" + gameId + "/blocks/" + block.id,
      {
        method: "DELETE",
        credentials: "include"
      }
    );
    const deletedBlock = await response.json();
    const newBlocks = blocks.filter((block2) => {
      return block2.id != deletedBlock.id;
    });
    setBlocks(newBlocks);
  }
  async function updateBlockWithEditorData(block, editorRef) {
    const content = editorRef.current.getContent();
    const content2 = block.content2;
    const response = await fetch(
      currentAPI + "/games/" + gameId + "/blocks/" + block.id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ content, content2 })
      }
    );
    const result = await response.json();
    const newBlocks = [...blocks];
    const adjustIndex = newBlocks.findIndex(
      (block2) => block2.id == result.id
    );
    newBlocks[adjustIndex] = result;
    setBlocks(newBlocks);
  }
  async function refreshBlock(id) {
    const response = await fetch(
      currentAPI + "/games/" + gameId + "/blocks/" + id
    );
    const result = await response.json();
    const newBlocks = [...blocks];
    const adjustIndex = newBlocks.findIndex(
      (block) => block.id == result.id
    );
    newBlocks[adjustIndex] = result;
    setBlocks(newBlocks);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isAdmin && /* @__PURE__ */ jsxs(
      "div",
      {
        id: "dev-toolbar",
        className: " self-stretch flex justify-center sticky top-0 bg-(--primary) sm:rounded-b max-w-full z-2 ",
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: " text-amber-50 w-50 px-2 py-0.5 flex justify-center items-center border-r border-(--outline-brown)/25 ",
              onClick: () => setAdminMode(!adminMode),
              children: adminMode ? "View Mode" : "Edit Mode"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              className: "text-amber-50 w-50 px-2 py-0.5 flex justify-center items-center text-center",
              to: pageManagerSlug,
              children: "Back to Page Manager"
            }
          )
        ]
      }
    ),
    adminMode && /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2 mt-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: async () => {
            await addBlock({
              nextOrder: 0
            });
          },
          className: "text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5",
          children: "+ Text Block"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: async () => {
            await addBlock({
              nextOrder: 0,
              type: "single-image"
            });
          },
          className: "text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5",
          children: "+ Image Block"
        }
      )
    ] }),
    blocks.sort((a, b) => a.order - b.order).map((block) => {
      let blockType;
      const buttons = adminMode ? /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: async () => {
              await addBlock({
                nextOrder: block.order + 1
              });
            },
            className: "text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5",
            children: "+ Text Block"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: async () => {
              await addBlock({
                nextOrder: block.order + 1,
                type: "single-image"
              });
            },
            className: "text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5",
            children: "+ Image Block"
          }
        )
      ] }) : null;
      switch (block.type) {
        case null:
          blockType = /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              TextBlock,
              {
                deleteBlock: () => deleteBlock(block),
                block,
                updateBlockWithEditorData,
                adminMode,
                addBlock
              }
            ),
            buttons
          ] }, block.id);
          break;
        default:
          blockType = /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              SingleImageBlock,
              {
                deleteBlock: () => deleteBlock(block),
                block,
                refreshBlock,
                adminMode,
                addBlock
              }
            ),
            buttons
          ] }, block.id);
      }
      return blockType;
    }),
    user?.role === "ADMIN" && /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center mt-2 gap-2", children: /* @__PURE__ */ jsx(
      Link,
      {
        className: "text-amber-50 bg-(--primary) w-50 rounded px-2 py-0.5 cursor-pointer hover:opacity-90 text-center",
        to: pageManagerSlug,
        children: "Back to Page Manager"
      }
    ) })
  ] });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PageBuilder
}, Symbol.toStringTag, { value: "Module" }));
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PageBuilder
}, Symbol.toStringTag, { value: "Module" }));
const gameLayout = UNSAFE_withComponentProps(function GameLayout() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: gameLayout
}, Symbol.toStringTag, { value: "Module" }));
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PageBuilder
}, Symbol.toStringTag, { value: "Module" }));
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PageBuilder
}, Symbol.toStringTag, { value: "Module" }));
function GuardianCosts() {
  const [fromLevel, setFromLevel] = useState(1);
  const [toLevel, setToLevel] = useState(2);
  const [rarity, setRarity] = useState("mythic");
  const upgradeCosts = {
    immortal: {
      1: {
        stones: 0,
        gold: 0
      },
      2: {
        stones: 5,
        gold: 2e3
      },
      3: {
        stones: 10,
        gold: 4e3
      },
      4: {
        stones: 20,
        gold: 8e3
      },
      5: {
        stones: 30,
        gold: 12e3
      },
      6: {
        stones: 50,
        gold: 2e4
      },
      7: {
        stones: 70,
        gold: 28e3
      },
      8: {
        stones: 100,
        gold: 4e4
      },
      9: {
        stones: 130,
        gold: 52e3
      },
      10: {
        stones: 170,
        gold: 68e3
      },
      11: {
        stones: 210,
        gold: 84e3
      },
      12: {
        stones: 260,
        gold: 104e3
      },
      13: {
        stones: 310,
        gold: 124e3
      },
      14: {
        stones: 360,
        gold: 144e3
      },
      15: {
        stones: 430,
        gold: 172e3
      }
    },
    mythic: {
      1: {
        stones: 0,
        gold: 0
      },
      2: {
        stones: 5,
        gold: 1e3
      },
      3: {
        stones: 10,
        gold: 2e3
      },
      4: {
        stones: 20,
        gold: 4e3
      },
      5: {
        stones: 30,
        gold: 6e3
      },
      6: {
        stones: 50,
        gold: 1e4
      },
      7: {
        stones: 70,
        gold: 14e3
      },
      8: {
        stones: 100,
        gold: 2e4
      },
      9: {
        stones: 130,
        gold: 26e3
      },
      10: {
        stones: 170,
        gold: 34e3
      },
      11: {
        stones: 210,
        gold: 42e3
      },
      12: {
        stones: 260,
        gold: 52e3
      },
      13: {
        stones: 310,
        gold: 62e3
      },
      14: {
        stones: 360,
        gold: 72e3
      },
      15: {
        stones: 430,
        gold: 86e3
      }
    },
    legendary: {
      1: {
        duplicates: 0,
        gold: 0
      },
      2: {
        duplicates: 2,
        gold: 1e3
      },
      3: {
        duplicates: 3,
        gold: 2e3
      },
      4: {
        duplicates: 4,
        gold: 4e3
      },
      5: {
        duplicates: 10,
        gold: 6e3
      },
      6: {
        duplicates: 15,
        gold: 1e4
      },
      7: {
        duplicates: 20,
        gold: 14e3
      },
      8: {
        duplicates: 30,
        gold: 2e4
      },
      9: {
        duplicates: 40,
        gold: 26e3
      },
      10: {
        duplicates: 50,
        gold: 34e3
      },
      11: {
        duplicates: 65,
        gold: 42e3
      },
      12: {
        duplicates: 80,
        gold: 52e3
      },
      13: {
        duplicates: 95,
        gold: 62e3
      },
      14: {
        duplicates: 110,
        gold: 72e3
      },
      15: {
        duplicates: 130,
        gold: 86e3
      }
    },
    epic: {
      1: {
        duplicates: 0,
        gold: 0
      },
      2: {
        duplicates: 3,
        gold: 1e3
      },
      3: {
        duplicates: 4,
        gold: 2e3
      },
      4: {
        duplicates: 8,
        gold: 4e3
      },
      5: {
        duplicates: 12,
        gold: 6e3
      },
      6: {
        duplicates: 20,
        gold: 1e4
      },
      7: {
        duplicates: 30,
        gold: 14e3
      },
      8: {
        duplicates: 40,
        gold: 2e4
      },
      9: {
        duplicates: 50,
        gold: 26e3
      },
      10: {
        duplicates: 70,
        gold: 34e3
      },
      11: {
        duplicates: 85,
        gold: 42e3
      },
      12: {
        duplicates: 105,
        gold: 52e3
      },
      13: {
        duplicates: 125,
        gold: 62e3
      },
      14: {
        duplicates: 145,
        gold: 72e3
      },
      15: {
        duplicates: 170,
        gold: 86e3
      }
    },
    rare: {
      1: {
        duplicates: 0,
        gold: 0
      },
      2: {
        duplicates: 3,
        gold: 1e3
      },
      3: {
        duplicates: 6,
        gold: 2e3
      },
      4: {
        duplicates: 10,
        gold: 3e3
      },
      5: {
        duplicates: 20,
        gold: 5e3
      },
      6: {
        duplicates: 30,
        gold: 8e3
      },
      7: {
        duplicates: 40,
        gold: 12e3
      },
      8: {
        duplicates: 60,
        gold: 17e3
      },
      9: {
        duplicates: 80,
        gold: 22e3
      },
      10: {
        duplicates: 100,
        gold: 28e3
      },
      11: {
        duplicates: 130,
        gold: 35e3
      },
      12: {
        duplicates: 160,
        gold: 43e3
      },
      13: {
        duplicates: 190,
        gold: 52e3
      },
      14: {
        duplicates: 220,
        gold: 6e4
      },
      15: {
        duplicates: 260,
        gold: 72e3
      }
    },
    common: {
      1: {
        duplicates: 0,
        gold: 0
      },
      2: {
        duplicates: 5,
        gold: 500
      },
      3: {
        duplicates: 10,
        gold: 1e3
      },
      4: {
        duplicates: 20,
        gold: 2e3
      },
      5: {
        duplicates: 30,
        gold: 3e3
      },
      6: {
        duplicates: 50,
        gold: 5e3
      },
      7: {
        duplicates: 70,
        gold: 7e3
      },
      8: {
        duplicates: 100,
        gold: 1e4
      },
      9: {
        duplicates: 130,
        gold: 13e3
      },
      10: {
        duplicates: 170,
        gold: 17e3
      },
      11: {
        duplicates: 210,
        gold: 21e3
      },
      12: {
        duplicates: 260,
        gold: 26e3
      },
      13: {
        duplicates: 310,
        gold: 31e3
      },
      14: {
        duplicates: 360,
        gold: 36e3
      },
      15: {
        duplicates: 430,
        gold: 43e3
      }
    }
  };
  let totalGold = 0;
  let totalDuplicates = 0;
  let totalStones = 0;
  let costMessage = "";
  if (rarity === "mythic" || rarity === "immortal") {
    for (let i = Number(fromLevel) + 1; i <= Number(toLevel); i++) {
      totalStones += upgradeCosts[rarity][i].stones;
      totalGold += upgradeCosts[rarity][i].gold;
    }
    if (totalGold > 1e3) {
      totalGold = totalGold / 1e3 + "k";
    }
    costMessage = /* @__PURE__ */ jsxs("p", { children: [
      "Total Stones: ",
      totalStones,
      " ",
      /* @__PURE__ */ jsx("br", {}),
      " Total Gold: ",
      totalGold
    ] });
  } else {
    for (let i = Number(fromLevel) + 1; i <= Number(toLevel); i++) {
      totalDuplicates += upgradeCosts[rarity][i].duplicates;
      totalGold += upgradeCosts[rarity][i].gold;
    }
    if (totalGold > 1e3) {
      totalGold = totalGold / 1e3 + "k";
    }
    costMessage = /* @__PURE__ */ jsxs("p", { children: [
      "Total Duplicates: ",
      totalDuplicates,
      /* @__PURE__ */ jsx("br", {}),
      "Total Gold:",
      totalGold
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { class: "content-block self-center text-left px-4 w-full lg:px-10", children: [
      /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Upgrade Costs" }) }),
      /* @__PURE__ */ jsx("p", { children: "This is a list of all the upgrade costs for all units in the game." }),
      /* @__PURE__ */ jsx("p", { children: "Choose a rarity to see costs:" }),
      /* @__PURE__ */ jsxs("form", { action: "", children: [
        /* @__PURE__ */ jsx("label", { for: "rarity-selector", children: "Rarity: " }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            name: "rarity-selector",
            id: "rarity-selector",
            value: rarity,
            onChange: (e) => setRarity(e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "mythic", children: "Mythic" }),
              /* @__PURE__ */ jsx("option", { value: "immortal", children: "Immortal" }),
              /* @__PURE__ */ jsx("option", { value: "legendary", children: "Legendary" }),
              /* @__PURE__ */ jsx("option", { value: "epic", children: "Epic" }),
              /* @__PURE__ */ jsx("option", { value: "rare", children: "Rare" }),
              /* @__PURE__ */ jsx("option", { value: "common", children: "Common" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("label", { for: "from-level", children: " From: " }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            name: "from-level",
            id: "from-level",
            value: fromLevel,
            onChange: (e) => {
              const value = +e.target.value < +toLevel ? +e.target.value : +toLevel - 1;
              setFromLevel(value);
            },
            children: [
              /* @__PURE__ */ jsx("option", { value: "1", children: "1" }),
              /* @__PURE__ */ jsx("option", { value: "2", children: "2" }),
              /* @__PURE__ */ jsx("option", { value: "3", children: "3" }),
              /* @__PURE__ */ jsx("option", { value: "4", children: "4" }),
              /* @__PURE__ */ jsx("option", { value: "5", children: "5" }),
              /* @__PURE__ */ jsx("option", { value: "6", children: "6" }),
              /* @__PURE__ */ jsx("option", { value: "7", children: "7" }),
              /* @__PURE__ */ jsx("option", { value: "8", children: "8" }),
              /* @__PURE__ */ jsx("option", { value: "9", children: "9" }),
              /* @__PURE__ */ jsx("option", { value: "10", children: "10" }),
              /* @__PURE__ */ jsx("option", { value: "11", children: "11" }),
              /* @__PURE__ */ jsx("option", { value: "12", children: "12" }),
              /* @__PURE__ */ jsx("option", { value: "13", children: "13" }),
              /* @__PURE__ */ jsx("option", { value: "14", children: "14" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("label", { for: "to-level", children: " To: " }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            name: "to-level",
            id: "to-level",
            value: toLevel,
            onChange: (e) => {
              const value = +e.target.value > +fromLevel ? +e.target.value : +fromLevel + 1;
              setToLevel(value);
            },
            children: [
              /* @__PURE__ */ jsx("option", { value: "2", children: "2" }),
              /* @__PURE__ */ jsx("option", { value: "3", children: "3" }),
              /* @__PURE__ */ jsx("option", { value: "4", children: "4" }),
              /* @__PURE__ */ jsx("option", { value: "5", children: "5" }),
              /* @__PURE__ */ jsx("option", { value: "6", children: "6" }),
              /* @__PURE__ */ jsx("option", { value: "7", children: "7" }),
              /* @__PURE__ */ jsx("option", { value: "8", children: "8" }),
              /* @__PURE__ */ jsx("option", { value: "9", children: "9" }),
              /* @__PURE__ */ jsx("option", { value: "10", children: "10" }),
              /* @__PURE__ */ jsx("option", { value: "11", children: "11" }),
              /* @__PURE__ */ jsx("option", { value: "12", children: "12" }),
              /* @__PURE__ */ jsx("option", { value: "13", children: "13" }),
              /* @__PURE__ */ jsx("option", { value: "14", children: "14" }),
              /* @__PURE__ */ jsx("option", { value: "15", children: "15" })
            ]
          }
        )
      ] }),
      costMessage
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "content-block", children: [
      rarity == "mythic" && /* @__PURE__ */ jsxs("div", { class: "rarity-table", id: "mythic", children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Mythic (Short Version)" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level Range" }),
            /* @__PURE__ */ jsx("th", { children: "Mythic Stones" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "115 stones" }),
              /* @__PURE__ */ jsx("td", { children: "23,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "940 stones" }),
              /* @__PURE__ */ jsx("td", { children: "188,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "1,100 stones" }),
              /* @__PURE__ */ jsx("td", { children: "220,000 gold" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Mythic" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level" }),
            /* @__PURE__ */ jsx("th", { children: "Mythic Stones" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 2" }),
              /* @__PURE__ */ jsx("td", { children: "5 stones" }),
              /* @__PURE__ */ jsx("td", { children: "1,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "2 → 3" }),
              /* @__PURE__ */ jsx("td", { children: "10 stones" }),
              /* @__PURE__ */ jsx("td", { children: "2,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "3 → 4" }),
              /* @__PURE__ */ jsx("td", { children: "20 stones" }),
              /* @__PURE__ */ jsx("td", { children: "4,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "4 → 5" }),
              /* @__PURE__ */ jsx("td", { children: "30 stones" }),
              /* @__PURE__ */ jsx("td", { children: "6,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "5 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "50 stones" }),
              /* @__PURE__ */ jsx("td", { children: "10,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 7" }),
              /* @__PURE__ */ jsx("td", { children: "70 stones" }),
              /* @__PURE__ */ jsx("td", { children: "14,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "7 → 8" }),
              /* @__PURE__ */ jsx("td", { children: "100 stones" }),
              /* @__PURE__ */ jsx("td", { children: "20,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "8 → 9" }),
              /* @__PURE__ */ jsx("td", { children: "130 stones" }),
              /* @__PURE__ */ jsx("td", { children: "26,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "9 → 10" }),
              /* @__PURE__ */ jsx("td", { children: "170 stones" }),
              /* @__PURE__ */ jsx("td", { children: "34,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "10 → 11" }),
              /* @__PURE__ */ jsx("td", { children: "210 stones" }),
              /* @__PURE__ */ jsx("td", { children: "42,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "11 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "260 stones" }),
              /* @__PURE__ */ jsx("td", { children: "52,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 13" }),
              /* @__PURE__ */ jsx("td", { children: "310 stones" }),
              /* @__PURE__ */ jsx("td", { children: "62,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "13 → 14" }),
              /* @__PURE__ */ jsx("td", { children: "360 stones" }),
              /* @__PURE__ */ jsx("td", { children: "72,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "14 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "430 stones" }),
              /* @__PURE__ */ jsx("td", { children: "86,000 gold" })
            ] })
          ] })
        ] })
      ] }),
      rarity == "immortal" && /* @__PURE__ */ jsxs("div", { class: "rarity-table hide", id: "immortal", children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Immortal (Short Version)" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level Range" }),
            /* @__PURE__ */ jsx("th", { children: "Immortal Stones" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "115 stones" }),
              /* @__PURE__ */ jsx("td", { children: "46,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "940 stones" }),
              /* @__PURE__ */ jsx("td", { children: "376,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "1,100 stones" }),
              /* @__PURE__ */ jsx("td", { children: "440,000 gold" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Immortal" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level" }),
            /* @__PURE__ */ jsx("th", { children: "Immortal Stones" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 2" }),
              /* @__PURE__ */ jsx("td", { children: "5 stones" }),
              /* @__PURE__ */ jsx("td", { children: "2,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "2 → 3" }),
              /* @__PURE__ */ jsx("td", { children: "10 stones" }),
              /* @__PURE__ */ jsx("td", { children: "4,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "3 → 4" }),
              /* @__PURE__ */ jsx("td", { children: "20 stones" }),
              /* @__PURE__ */ jsx("td", { children: "8,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "4 → 5" }),
              /* @__PURE__ */ jsx("td", { children: "30 stones" }),
              /* @__PURE__ */ jsx("td", { children: "12,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "5 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "50 stones" }),
              /* @__PURE__ */ jsx("td", { children: "20,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 7" }),
              /* @__PURE__ */ jsx("td", { children: "70 stones" }),
              /* @__PURE__ */ jsx("td", { children: "28,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "7 → 8" }),
              /* @__PURE__ */ jsx("td", { children: "100 stones" }),
              /* @__PURE__ */ jsx("td", { children: "40,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "8 → 9" }),
              /* @__PURE__ */ jsx("td", { children: "130 stones" }),
              /* @__PURE__ */ jsx("td", { children: "52,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "9 → 10" }),
              /* @__PURE__ */ jsx("td", { children: "170 stones" }),
              /* @__PURE__ */ jsx("td", { children: "68,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "10 → 11" }),
              /* @__PURE__ */ jsx("td", { children: "210 stones" }),
              /* @__PURE__ */ jsx("td", { children: "84,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "11 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "260 stones" }),
              /* @__PURE__ */ jsx("td", { children: "104,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 13" }),
              /* @__PURE__ */ jsx("td", { children: "310 stones" }),
              /* @__PURE__ */ jsx("td", { children: "124,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "13 → 14" }),
              /* @__PURE__ */ jsx("td", { children: "360 stones" }),
              /* @__PURE__ */ jsx("td", { children: "144,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "14 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "430 stones" }),
              /* @__PURE__ */ jsx("td", { children: "172,000 gold" })
            ] })
          ] })
        ] })
      ] }),
      rarity == "legendary" && /* @__PURE__ */ jsxs("div", { class: "rarity-table hide", id: "legendary", children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Legendary" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level" }),
            /* @__PURE__ */ jsx("th", { children: "Duplicates" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 2" }),
              /* @__PURE__ */ jsx("td", { children: "2 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "1,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "2 → 3" }),
              /* @__PURE__ */ jsx("td", { children: "3 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "2,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "3 → 4" }),
              /* @__PURE__ */ jsx("td", { children: "4 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "4,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "4 → 5" }),
              /* @__PURE__ */ jsx("td", { children: "10 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "6,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "5 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "15 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "10,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 7" }),
              /* @__PURE__ */ jsx("td", { children: "20 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "14,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "7 → 8" }),
              /* @__PURE__ */ jsx("td", { children: "30 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "20,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "8 → 9" }),
              /* @__PURE__ */ jsx("td", { children: "40 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "26,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "9 → 10" }),
              /* @__PURE__ */ jsx("td", { children: "50 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "34,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "10 → 11" }),
              /* @__PURE__ */ jsx("td", { children: "65 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "42,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "11 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "80 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "52,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 13" }),
              /* @__PURE__ */ jsx("td", { children: "95 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "62,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "13 → 14" }),
              /* @__PURE__ */ jsx("td", { children: "110 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "72,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "14 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "130 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "86,000 gold" })
            ] })
          ] })
        ] })
      ] }),
      rarity == "epic" && /* @__PURE__ */ jsxs("div", { class: "rarity-table hide", id: "epic", children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Epic" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level" }),
            /* @__PURE__ */ jsx("th", { children: "Duplicates" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 2" }),
              /* @__PURE__ */ jsx("td", { children: "3 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "1,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "2 → 3" }),
              /* @__PURE__ */ jsx("td", { children: "4 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "2,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "3 → 4" }),
              /* @__PURE__ */ jsx("td", { children: "8 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "4,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "4 → 5" }),
              /* @__PURE__ */ jsx("td", { children: "12 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "6,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "5 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "20 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "10,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 7" }),
              /* @__PURE__ */ jsx("td", { children: "30 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "14,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "7 → 8" }),
              /* @__PURE__ */ jsx("td", { children: "40 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "20,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "8 → 9" }),
              /* @__PURE__ */ jsx("td", { children: "50 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "26,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "9 → 10" }),
              /* @__PURE__ */ jsx("td", { children: "70 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "34,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "10 → 11" }),
              /* @__PURE__ */ jsx("td", { children: "85 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "42,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "11 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "105 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "52,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 13" }),
              /* @__PURE__ */ jsx("td", { children: "125 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "62,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "13 → 14" }),
              /* @__PURE__ */ jsx("td", { children: "145 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "72,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "14 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "170 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "86,000 gold" })
            ] })
          ] })
        ] })
      ] }),
      rarity == "rare" && /* @__PURE__ */ jsxs("div", { class: "rarity-table hide", id: "rare", children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Rare" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level" }),
            /* @__PURE__ */ jsx("th", { children: "Duplicates" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 2" }),
              /* @__PURE__ */ jsx("td", { children: "3 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "1,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "2 → 3" }),
              /* @__PURE__ */ jsx("td", { children: "6 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "2,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "3 → 4" }),
              /* @__PURE__ */ jsx("td", { children: "10 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "3,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "4 → 5" }),
              /* @__PURE__ */ jsx("td", { children: "20 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "5,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "5 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "30 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "8,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 7" }),
              /* @__PURE__ */ jsx("td", { children: "40 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "12,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "7 → 8" }),
              /* @__PURE__ */ jsx("td", { children: "60 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "17,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "8 → 9" }),
              /* @__PURE__ */ jsx("td", { children: "80 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "22,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "9 → 10" }),
              /* @__PURE__ */ jsx("td", { children: "100 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "28,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "10 → 11" }),
              /* @__PURE__ */ jsx("td", { children: "130 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "35,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "11 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "160 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "43,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 13" }),
              /* @__PURE__ */ jsx("td", { children: "190 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "52,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "13 → 14" }),
              /* @__PURE__ */ jsx("td", { children: "220 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "60,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "14 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "260 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "72,000 gold" })
            ] })
          ] })
        ] })
      ] }),
      rarity == "common" && /* @__PURE__ */ jsxs("div", { class: "rarity-table hide", id: "common", children: [
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("u", { children: "Common" }) }),
        /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Level" }),
            /* @__PURE__ */ jsx("th", { children: "Duplicates" }),
            /* @__PURE__ */ jsx("th", { children: "Gold" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "1 → 2" }),
              /* @__PURE__ */ jsx("td", { children: "5 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "500 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "2 → 3" }),
              /* @__PURE__ */ jsx("td", { children: "10 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "1,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "3 → 4" }),
              /* @__PURE__ */ jsx("td", { children: "20 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "2,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "4 → 5" }),
              /* @__PURE__ */ jsx("td", { children: "30 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "3,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "5 → 6" }),
              /* @__PURE__ */ jsx("td", { children: "50 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "5,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "6 → 7" }),
              /* @__PURE__ */ jsx("td", { children: "70 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "7,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "7 → 8" }),
              /* @__PURE__ */ jsx("td", { children: "100 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "10,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "8 → 9" }),
              /* @__PURE__ */ jsx("td", { children: "130 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "13,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "9 → 10" }),
              /* @__PURE__ */ jsx("td", { children: "170 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "17,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "10 → 11" }),
              /* @__PURE__ */ jsx("td", { children: "210 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "21,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "11 → 12" }),
              /* @__PURE__ */ jsx("td", { children: "260 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "26,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "12 → 13" }),
              /* @__PURE__ */ jsx("td", { children: "310 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "31,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "13 → 14" }),
              /* @__PURE__ */ jsx("td", { children: "360 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "36,000 gold" })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { children: "14 → 15" }),
              /* @__PURE__ */ jsx("td", { children: "430 duplicates" }),
              /* @__PURE__ */ jsx("td", { children: "43,000 gold" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
const handle$7 = {
  title: "Upgrade Costs"
};
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: GuardianCosts,
  handle: handle$7
}, Symbol.toStringTag, { value: "Module" }));
const awakenedHailey = "/assets/Awakened%20Hailey-DZpHKxQv.png";
const topVayne = "/assets/Top%20Vayne-CfqKaZFo.png";
const doctorPulse = "/assets/Doctor%20Pulse-D_9wBhFT.png";
const reaperFrog = "/assets/Reaper%20Frog-DTzSOz9G.png";
const chronoAto = "/assets/Chrono%20Ato-CL1-UM0V.png";
const ghostNinja = "/assets/Ninja1-CIb5annO.png";
const primevalBomba = "/assets/Primeval%20Bomba-8GCoQRTh.png";
const grandMama = "/assets/Grand%20Mama-DG4VBHC_.png";
const reaperDian = "/assets/Reaper%20Dian-29VnN87L.png";
const chevron = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%3e%3cpath%20fill='white'%20d='M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z'%20/%3e%3c/svg%3e";
const reaperFrogSkills = "/assets/reaper-frog-skills-B-i3laaS.webp";
const reaperDianSkills = "/assets/reaper-skills-DDBPD9W0.webp";
const awakenedHaileySkills = "/assets/Awakened%20Hailey%20Skills-DuZZgtQk.png";
const grandMamaSkills = "/assets/grand-mama-skills-BuAj5Fw2.webp";
const primevalBomba1 = "/assets/Primeval%20Bomba1-Cn-tfRvy.png";
const primevalBombaSkills = "/assets/Primeval%20Bomba%20skills-DHc2uNfg.png";
const ghostNinjaSkills = "/assets/Ghost%20Ninja%20skills-Dt-G9rvK.png";
const chronoAtoSkills = "/assets/chronoskills-DGnwTmzo.png";
const doctorPulseSkills = "/assets/pulseskills-Cbzq5tGc.webp";
const topVayneSkills = "/assets/vayneskills-D-fcjffq.webp";
function ToggleSection({ title, icon, children, id, imgSrc }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "toggle-section", id, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `toggle-button ${open ? "expanded-button" : ""}`,
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxs("p", { className: "flex w-full", children: [
            title,
            /* @__PURE__ */ jsx("img", { className: "mini icon ml-auto", src: imgSrc, alt: "" }),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: chevron,
                alt: "",
                class: "inline-img toggle-button-arrow"
              }
            )
          ] }),
          icon && /* @__PURE__ */ jsx("img", { className: "mini icon", src: icon, alt: "" }),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "../pics/Icons/chevron-up-white.svg",
              alt: "",
              className: "inline-img toggle-button-arrow"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `toggle-panel ${open ? "" : "collapsed"} ${open ? "" : "unscrollable"}`,
        style: {
          maxHeight: open ? "none" : void 0
        },
        children
      }
    )
  ] });
}
function ImmortalGuardians() {
  return /* @__PURE__ */ jsxs("div", { class: "text-width content-block immortal-guide", children: [
    /* @__PURE__ */ jsxs(ToggleSection, { title: "How to unlock Immortal Guardians", children: [
      /* @__PURE__ */ jsx("p", { children: 'An Immortal Guardian unlocks when you get their mythic form to level 15. Once the mythic form is level 15, you can pay 6000 gems to unlock the immortal form. The actual "Immortal" tab to view Immortal Guardians unlocks once you get any mythic to level 12.' }),
      /* @__PURE__ */ jsx("div", { class: "centered-imgs", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "../pics/screens/finding-immortal-tab.webp",
          alt: "",
          class: "image-one"
        }
      ) }),
      /* @__PURE__ */ jsx("p", { children: "After being unlocked, each immortal guardian has their own summon requirements in-game. NOTE: Only one copy of an Immortal can be summoned at a time. For Immortals with two forms like Reaper Frog, only one of those forms can be summoned at a time." })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Leveling Up", children: [
      /* @__PURE__ */ jsxs("div", { class: "text-right-img-left", children: [
        /* @__PURE__ */ jsx("p", { children: "Each immortal guardian has a different level separate from the level of their mythic form, and it starts at level 1. Note that they're typically still very strong at level 1, but the upgrades are notable increases in strength. Level 1 to level 6 is fairly easy to get, and is worth going for right after unlocking an Immortal. To level them up you need Immortal Stones instead of Mythic Stones. As of now, the only way to get Immortal Stones is through:" }),
        /* @__PURE__ */ jsx(
          "img",
          {
            class: "image-two",
            src: "../pics/immortal-guide/immortal-upgrade-screen.webp",
            alt: ""
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "margin-top: 8px", children: [
        /* @__PURE__ */ jsx("li", { children: "God Mode" }),
        /* @__PURE__ */ jsx("li", { children: "Guild Shop" }),
        /* @__PURE__ */ jsx("li", { children: "Pvp shop" }),
        /* @__PURE__ */ jsx("li", { children: "The Normal Shop for gems" }),
        /* @__PURE__ */ jsx("li", { children: "Events" })
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "You can see the cost to level up immortals",
        /* @__PURE__ */ jsx("a", { href: "guardian-upgrade-costs.html", children: "here" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ToggleSection, { title: "Immortals and Treasures", children: /* @__PURE__ */ jsx("p", { children: "None of the Immortals are directly affected by Mythic Treasures. It's worth noting that the first 3 all do benefit from them on the way to summon them. The Mythic Frog's treasure gives some material back if a curse lift is failed. This means that it's easier to try again after each failed curse lift. Mama's treasure lets her summon imps more quickly. Hailey's treasure allows her to gather Star Power more quickly. All of these effects speed up their ability to turn into their immortal form, but once in the form they don't hold these treasures or benefit from any of the effects." }) }),
    /* @__PURE__ */ jsx(ToggleSection, { title: "Immortals vs Night Shaman", children: /* @__PURE__ */ jsx("p", { children: "In Hell and God Mode, there's a boss called Night Shaman that can change your Guardians into other Guardians. One of the best traits of Immortal Guardians is that they cannot be changed into another Guardian. This makes them even better than they would already be just being higher tier characters with more damage, because it gives your board some resilience." }) }),
    /* @__PURE__ */ jsx("h1", { className: "mt-4 mx-2", children: "The List of Immortal Guardians" }),
    /* @__PURE__ */ jsx("p", { className: "px-2", children: "Below is a list of all the different Immortal Guardians. It'll explain how to actually summon them, since they have unique summon methods, it'll discuss their role/playstyle, and have a video of them being used." }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Reaper Frog/Dian", imgSrc: reaperDian, children: [
      /* @__PURE__ */ jsxs("div", { class: "two-centered-imgs", children: [
        /* @__PURE__ */ jsx("img", { src: reaperFrog, alt: "" }),
        /* @__PURE__ */ jsx("img", { src: reaperDian, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsxs("h3", { children: [
        "Frog Form",
        /* @__PURE__ */ jsx("img", { class: "mini", src: reaperFrog, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Reaper Frog is a Physical Damage DPS Guardian. He's easy to summon, and he does good damage. He has two forms: Frog Form, and Dian Form. Unlike the Mythic Frog Form, Immortal Reaper Frog is a very solid DPS unit. He has damage comparative to Lazy Taoist or Overclocked Rocket Chu. He's also much cheaper to summon than Rocket Chu, which is very good since they both have a chance to die when being summoned, meaning the risk is lower when summoning Reaper Frog, although Rocket Chu does have a higher success rate at 50% versus Frogs 35%." }),
      /* @__PURE__ */ jsx("p", { children: `Reaper Frog's summon cost is low enough that at Luck Stone level 6+, he can somewhat consistently be summoned before wave 20 on Hell Mode. Since all you have to do is get a King Dian, you'll get a Reaper Frog on average within 3 tries. He can easily carry until wave 40, usually including the wave 40 boss. This makes him a great unit to allow you to stack econ, and slowly build the rest of your board. He also applies 80 slow to enemies with his skill "Suppression", which is overall a great skill to have as it prevents stun leaks. For comparison, the Mythic Guardian Coldy applies 50 slow with her passive, and 50 slow with her skill, and Penguin Musician applies 60 with his skill. So Reaper Frog's 80 slow is one of the stronger slows in the game.` }),
      /* @__PURE__ */ jsxs("h3", { children: [
        "Dian Form",
        /* @__PURE__ */ jsx("img", { class: "mini", src: reaperDian, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Reaper Dian is a Magic Damage DPS Guardian. When you get Reaper Frog, you can do the same curse lift ability the standard frog has to transform him into Reaper Dian. It has a 35% chance to succeed by default, increasing to a 50% chance to succeed at level 12. Overall, this means the odds of succeeding in both transformations is 12.25% normally, and is raised to 17.5% at level 12. Or, 1 Reaper Dian every 8 regular Frogs 1 Reaper Dian per 6 regular Frogs at level 12. Reaper Dian is a significant upgrade overall. There have been videos of high level players clearing Hell Mode with Reaper Dian as the only DPS on the board. His skills and passives all revolve around dealing massive damage." }),
      /* @__PURE__ */ jsx("h2", { children: "Skills" }),
      /* @__PURE__ */ jsxs("div", { class: "two-centered-imgs-flat-height", children: [
        /* @__PURE__ */ jsx("img", { src: reaperFrogSkills, alt: "" }),
        /* @__PURE__ */ jsx("img", { src: reaperDianSkills, alt: "" })
      ] }),
      /* @__PURE__ */ jsxs("h3", { children: [
        "Frog Form",
        /* @__PURE__ */ jsx("img", { class: "mini", src: reaperFrog, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Reaper's Ascension - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 35% chance to ascend and become a divine being. Vanishes when ascension fails. (50% chance at level 12)" }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Suppression - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 8% chance to deal 12000% Physical DMG to enemies in their range and reduce their movement speed by 80." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Execution - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 12% chance to deal 9000% Physical DMG to enemies in range. Instantly executes enemies if their HP is below 5%." }),
      /* @__PURE__ */ jsxs("h3", { children: [
        "Dian Form",
        /* @__PURE__ */ jsx("img", { class: "mini", src: reaperDian, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Reaper's Instinct - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Instantly executes enemies with HP below 5%." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Death Lightning - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Basic attacks deal 2000% area damage." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Chain Lightning - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has an 8% chance to deal 35000% Magic DMG to a target and chain the damage to nearby enemies 10 times." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Death Touch - ULT" }) }),
      /* @__PURE__ */ jsx("p", { children: "Summons a hellish zone that lasts for 20s, dealing 600% Magic DMG every 0.1s." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Reaper Frog is the easiest to summon out of the first 3 Immortal Guardians. To get a him, all you need to do is turn a normal frog into a Dian. Once you get a Dian, at any point you will be able to convert it into a Reaper Frog. From there, you can try to curse lift your Reaper Frog, into his Reaper Dian Form." }),
      /* @__PURE__ */ jsx("p", { children: "To get a Reaper Dian more easily, you can keep making Dians from the normal Mythic Frog. When you have both a Dian and a Reaper Frog on the board, if you try to lift the curse on the Frog and it fails, you can immediately turn your Dian into a Reaper Frog. You can use this strategy to make multiple attempts at Reaper Dian, without having to give up having his base Frog Form if you fail." }),
      /* @__PURE__ */ jsx("h2", { className: "text-align: center", children: "Gameplay" }),
      /* @__PURE__ */ jsx("div", { class: "centered-imgs", children: /* @__PURE__ */ jsx(
        "iframe",
        {
          width: "560",
          height: "315",
          src: "https://www.youtube.com/embed/6GRcoLeNQhY?si=bAmQ-D2YqJqxSFbV",
          title: "YouTube video player",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          referrerpolicy: "strict-origin-when-cross-origin",
          allowfullscreen: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Awakened Hailey", imgSrc: awakenedHailey, children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: awakenedHailey, alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Awakened Hailey is a Magical Damage DPS guardian. Her immortal form continues the style of her Mythic form in having a large ATK boost. To compare the ATK boost she gets from her skills, you'd need this much gold to get the same bonus from Money Gun:" }),
      /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsx("li", { children: "285k gold at Money Gun 1" }),
        /* @__PURE__ */ jsx("li", { children: "259k gold at Money Gun 2" }),
        /* @__PURE__ */ jsx("li", { children: "238k gold at Money Gun 3" }),
        /* @__PURE__ */ jsx("li", { children: "219k gold at Money Gun 4" }),
        /* @__PURE__ */ jsx("li", { children: "204k gold at Money Gun 5" }),
        /* @__PURE__ */ jsx("li", { children: "190k gold at Money Gun 6" }),
        /* @__PURE__ */ jsx("li", { children: "178k gold at Money Gun 7" }),
        /* @__PURE__ */ jsx("li", { children: "168k gold at Money Gun 8" }),
        /* @__PURE__ */ jsx("li", { children: "158k gold at Money Gun 9" }),
        /* @__PURE__ */ jsx("li", { children: "150k gold at Money Gun 10" }),
        /* @__PURE__ */ jsx("li", { children: "140k gold at Money Gun 11" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "This makes her especially good for lower sb/mg players and also particularly good for shorter game modes (PvP, guild battle, underground cave, daily dungeon) where Safe Box doesn't have time to grow gold to a significant level. Even at higher Safe Box levels, she is a really strong Wave Clear and is always worth a summon." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx("img", { class: "mini", src: awakenedHailey, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx("img", { src: awakenedHaileySkills, alt: "" }) }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Power of the Sun - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Power of the Sun increases ATK by 2000%. Additionally, skill damage increases by 5% for each different Mythic unit on the field." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Solar Ray - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 10% chance to deal 18000% Magic DMG to enemies in range." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Big Bang - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 10% chance to inject energy into a target. After 10s, the energy explodes, dealing 10000% Magic DMG to enemies in range. If injected to the same target 3 times, it explodes immediately, and the explosion deals an additional 100%." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Flare - Ult" }) }),
      /* @__PURE__ */ jsx("p", { children: "Creates a blazing sun for 10s, dealing 4500% Magic DMG every 0.4s and 50% to nearby enemies." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Awakened Hailey is summoned based on a 15% chance every time Mythic Hailey uses her Ult while having full Star Power (10). Because of this, you can signficantly speed up how quickly she can be Awakened by improving MP Regen." })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Grand Mama", imgSrc: grandMama, children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: grandMama, alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Grand Mama is a Support Guardian that deals Magic DMG. She's cheap to get on the board if you can get Mythic Mama summoned before wave 10. She's difficult to summon later in the game though. She applies a variety of buffs and debuffs through passives and skills:" }),
      /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsx("li", { children: "+225% or higher damage to the whole board (passive)" }),
        /* @__PURE__ */ jsx("li", { children: "Increases DMG taken by 15% (skill)" }),
        /* @__PURE__ */ jsx("li", { children: "Reduces healing by 50% (skill)" }),
        /* @__PURE__ */ jsx("li", { children: "Revives a random Mythic unit every 5 Mythic deaths (ULT)" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "NOTE: The revival skill counts failed Frog Curse Lifts, failed Chu Overclocks, and even Tar Cannibalisms. At level 12, this skill triggers on every 3 deaths instead of 5." }),
      /* @__PURE__ */ jsx("p", { children: "In Hell Mode, she can go to wave 40, but she will struggle to clear the wave 40 boss. Her damage is comparable to Lazy Taoist/Overclocked Rocket Chu." }),
      /* @__PURE__ */ jsx("p", { children: "Grand Mama shines particularly well in PvP. In PvP, players don't typically get enough gold to get large damage bonuses from Money Gun. With Grand Mama level 6, you can get a minimum of +225% damage from her passive bonus." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx("img", { class: "mini", src: grandMama, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx("img", { src: grandMamaSkills, alt: "" }) }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Assimilation - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "When Grand Mama is summoned, increases the ATK of all allies by 10% for each Imp that was merged." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Necromancy - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 9% chance to deal 6000% Magic DMG to enemies in range. If Necromancy kills an enemy, deals an additional 5000% Magic DMG to nearby enemies." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Mark of the Dead - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 10% chance to inflict enemies in range with a debuff that deals 1000% Magic DMG every 0.4s for 4s, increases damage taken by 15% for 4s, and reduces healing received by 50%." }),
      /* @__PURE__ */ jsx("h2", { children: "Assimilation Details" }),
      /* @__PURE__ */ jsx("p", { children: "Assimilation is an interesting skill. On paper, it sounds extremely powerful. In the right circumstances (pvp) it is. But in coop, it won't go as far as you think. This is because the damage bonus for Assimilation only applies to a characters base damage. This is different than Money Gun, because Money Gun stacks with other types of damage, like Mythic Damage Upgrade." }),
      /* @__PURE__ */ jsx("p", { children: "The short version is basically, after you reach 100k+ damage, less than 5% of your damage is going to be coming from Grand Mama's damage buff. However, in PvP players won't be getting that much gold anyways. This means that a +225% buff is going to be much more impactful. Since it's not dwarfed by the typical Money Gun damage buff." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "To summon a Grand Mama, you need to have at least 9 imps summoned by Mythic Mama. When you get 9 imps or more, the button to summon Grand Mama will show on screen. When pressed, she'll be summoned and absorb all the imps. Each imp will give a +10% ATK buff, unless she's level 6, where she'll instead give a +25% ATK buff." }),
      /* @__PURE__ */ jsx("p", { children: "This is a harder to accomplish in hell mode. The increased health of Hell Mode enemies makes it so that Mama's ult stops killing enemies much earlier. If you don't get a Mama before wave 10, you're likely going to have a hard time getting 9 imps. Even if you do, it's still going to take luck to get them. For this reason, Grand Mama is only really viable if you have Mama's exclusive treasure." }),
      /* @__PURE__ */ jsx("h2", { className: "text-align: center", children: "Gameplay" }),
      /* @__PURE__ */ jsx("div", { class: "centered-imgs", children: /* @__PURE__ */ jsx(
        "iframe",
        {
          width: "560",
          height: "315",
          src: "https://www.youtube.com/embed/dibri7t3aP4?si=gHg04zF5N3YG_sST",
          title: "YouTube video player",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          referrerpolicy: "strict-origin-when-cross-origin",
          allowfullscreen: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Primeval Bomba", imgSrc: primevalBomba, children: [
      /* @__PURE__ */ jsxs("div", { class: "two-centered-imgs", children: [
        /* @__PURE__ */ jsx("img", { src: primevalBomba, alt: "" }),
        /* @__PURE__ */ jsx("img", { src: primevalBomba1, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Primeval Bomba is a Physical Damage DPS guardian. There isn't a large direct commitment to getting Primeval Bomba, as you only need Bomba on the board to be able to get Primeval Bomba. Attack speed buffs help get Primeval Bomba more consistently, which is good because it's a buff you want to build up anyway." }),
      /* @__PURE__ */ jsx("p", { children: "His Primeval Form has two main differences, the basic attack, and the ultimate. The basic attack does not have a workout effect to strengthen it, instead, it just does 500% area damage at base, meaning Primeval Bomba does not need to build up stacks for full power." }),
      /* @__PURE__ */ jsx("p", { children: "The other main difference is the ultimate changes to cooldown-based instead of MP-based so MP Regen effects stop working on it. Primeval Bomba's ult also ignores some defense, which can be important in the late game. If you're around 40 below the desired DR, Primeval Bomba will still do major bonus damage in ultimate form." }),
      /* @__PURE__ */ jsx("p", { children: "His main role is being a top tier Wave Clear unit. Because his wave clear is so strong, this frees you up to summon units who are really bad at wave clear such as Watt or Vayne, without worrying about if you can survive the waves. You'll have good all around coverage for the entire game if you take advantage of this, so always make sure to pair him with a good boss killer!" }),
      /* @__PURE__ */ jsx("p", { children: "Lance works as well, but keep in mind he takes a melee space. Multiple Lances will end up fighting for space with Bomba, so realistically you'll only want 1 Lance next to your Bomba so they can attack at the same time." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx("img", { class: "mini", src: primevalBomba, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx("img", { src: primevalBombaSkills, alt: "" }) }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Shockwave - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Basic attacks deal 500% area damage." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Slam - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 10% chance to deal 4000% Physical DMG to enemies in range every 0.5s for 2.5s." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Uppercut - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Every 10 attacks, deals 8000% Physical DMG to enemies in range and increases basic attack damage by 100% for the next 5 hits." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Power Unleashed - ULT, cooldown (unlock at level 6)" }) }),
      /* @__PURE__ */ jsx("p", { children: "For 10s (20s at level 12), increases ATK by 100%, ATK SPD by 30% and ignores 25% of the target's DEF." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Primeval Bomba is summoned by Bomba having max workout stacks, and then every basic attack has a 0.1% chance for Primeval Bomba to be able to be summoned. Workout stacks are given by chance every basic attack Bomba does, this means summoning Primeval Bomba is ALL about basic attacks, so to speed up Primeval Bomba's activation, you will want a lot of attack speed." }),
      /* @__PURE__ */ jsx("p", { children: "A note for attack speeds, all attack speed buffs become more effective the more UNIQUE sources of attack speed there are. This means 2 eagles and 2 frogs is better than 6 eagles for example, even though they both only technically give 30% attack speed. So for maximum effectiveness, you will want many different sources of attack speed to speed up the Primeval Bomba process." }),
      /* @__PURE__ */ jsx("h2", { className: "text-align: center", children: "Gameplay" }),
      /* @__PURE__ */ jsx("div", { class: "centered-imgs", children: /* @__PURE__ */ jsx(
        "iframe",
        {
          width: "560",
          height: "315",
          src: "https://www.youtube.com/embed/234N-q5iJUs?si=_xhhmwqxCsgeGvb8",
          title: "YouTube video player",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          referrerpolicy: "strict-origin-when-cross-origin",
          allowfullscreen: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Ghost Ninja", imgSrc: ghostNinja, children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: ghostNinja, alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Ghost Ninja is a Physical Damage DPS guardian." }),
      /* @__PURE__ */ jsx("p", { children: "His base ATK is the lowest of the DPS Immortals. His passive is Critical Hit-based so there’s no control over it. His Execution and Throw skills have multipliers that are only slightly better than Rocket Chu. His ult Guillotine sounds like it is a boss killer move with its 50000% Physical DMG on one target but Awakened Hailey’s ult actually deals 112500% damage over its entire duration and has splash." }),
      /* @__PURE__ */ jsx("p", { children: "In conclusion, Ghost Ninja is rather unremarkable." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx("img", { class: "mini", src: ghostNinja, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx("img", { src: ghostNinjaSkills, alt: "" }) }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Opportunity - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "When a skill lands a Critical Hit, Ultimate cooldown is reduced by 2s." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Throw - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "After 10 attacks, deals 5000% Physical DMG to enemies in range 4 times." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Execution - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "10% chance to deal 4000% Physical DMG to enemies in range, with an additional 50% chance to activate the skill again. If this skill kills an enemy, the reactivation chance increases by 25%." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Guillotine - Ult, Cooldown" }) }),
      /* @__PURE__ */ jsx("p", { children: "Deals 50000% Physical DMG to a single target, or deals 35000% Physical DMG to all enemies in range with a 50% chance. CRT DMG is increased by 100%." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Sacrifice one Ninja with an 11-combo from Assassinate and 4 additional Ninjas. Combos are counted based on how many times Assassinate reactivates (55% reactivation chance). Ninja’s exclusive treasure Sharp Shuriken further increases the reactivation chance of Assassinate by up to 15%." }),
      /* @__PURE__ */ jsx("p", { children: "On paper, it seems like Shadow Ninja is really easy to summon. You have to summon 5 Ninjas anyway to sacrifice for the immortal form. The cost of 5 Ninjas isn’t super expensive (5 epics, 10 rares). But in practice, the issue is having enemies exist which can survive a 10-combo such that your Ninjas can complete an 11-combo. As such you have to juggle a fine balance between too many Ninjas killing enemies too fast, your teammate killing enemies too fast, and losing the game due to not dealing enough damage." }),
      /* @__PURE__ */ jsx("p", { children: "In Hard and God mode, you have the dungeon with bosses where your Ninjas can attempt their 11-combos non-stop but this will compete for spots with Bandits for gold farming." }),
      /* @__PURE__ */ jsx("p", { children: "Additionally, 5 Ninjas out of 18 spots on the board is a lot of space taken up. Ninja is also a Physical DPS and hence needs Defense Reduction on top of the usual stun setup. This means that attempting to summon Shadow Ninja only makes more sense in Hard and God with the Dungeon to have a better chance to get the 11-combo in time and more space to fit all the 5 Ninjas and Defense Reduction." })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Chrono Ato", imgSrc: chronoAto, children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: chronoAto, alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Chrono Ato is a very strong Physical Focused Support. He increases your DEF Reduction by 50%, allowing you to devote less of your board to DR. He also increases physical DMG Ult DMG, and reduces cooldown for guardians with cooldown based ULTs. (Verdee, Chu, Immortal Bomba, Ninja)" }),
      /* @__PURE__ */ jsx("p", { children: "He also slows enemies, so not only does he increase damage but he helps your stun by preventing leakage." }),
      /* @__PURE__ */ jsx("p", { children: "Often Ato ascends to Chrono Ato pretty late game. This is okay, because the most notable bonus from his immortal form is the +50% defense reduction bonus. This works out pretty well timing-wise because in general you don't need high defense reduction numbers until very late game anyways, like wave 65 or so." }),
      /* @__PURE__ */ jsx("p", { children: "It's also worth considering that to even ascend Ato, he needs to reduce friendly cooldowns by 100 seconds (see below) so your playstyle will need to involve a solid amount of guardians with cooldown based ults, not just mana based ults." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx("img", { class: "mini", src: chronoAto, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx("img", { src: chronoAtoSkills }) }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Fracture - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Increases the DEF reduction applied to all enemies by 50%." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Carrot Lunchbox - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Increases Physical DMG by 1% for every 20 DEF reduction." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Time Control - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "10% chance to distort time around the target, dealing 1000% Physical DMG every 0.5s for 5s, reducing MOV SPD by 70%." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Time Gift - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "12% chance to increase Physical DMG of allies within range by 15% for 10s, and make them attack twice every 5 basic attacks." }),
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: "Time Leap - Ult, Cooldown" }) }),
      /* @__PURE__ */ jsx("p", { children: "Increases Ultimate Skill DMG of allies within range by 25% for 10s and reduces their remaining cooldowns by 25%." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Chrono Ato is summoned after Ato has achieved a total cooldown reduction of 100s. Guardians which have cooldown ults include:" }),
      /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsx("li", { children: "Rocket Chu" }),
        /* @__PURE__ */ jsx("li", { children: "Primeval Bomba" }),
        /* @__PURE__ */ jsx("li", { children: "Verdee" }),
        /* @__PURE__ */ jsx("li", { children: "Ninja" }),
        /* @__PURE__ */ jsx("li", { children: "Penguin Musician" }),
        /* @__PURE__ */ jsx("li", { children: "Ghost Ninja" })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "text-align: center", children: "Gameplay" }),
      /* @__PURE__ */ jsx("div", { class: "centered-imgs", children: /* @__PURE__ */ jsx(
        "iframe",
        {
          width: "560",
          height: "315",
          src: "https://www.youtube.com/embed/AN35fUjAUlw?si=HP43jzMYU-RmF1Jd",
          title: "YouTube video player",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          referrerpolicy: "strict-origin-when-cross-origin",
          allowfullscreen: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Doctor Pulse", imgSrc: doctorPulse, children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: doctorPulse, alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Dr. Pulse is a Magical Damage DPS guardian. His main draw is that Pulse Generator does not need a Legendary to summon and the immortal summon condition is relatively easy to attain. The tradeoff is that he is one of the weakest immortals thus far." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx("img", { class: "mini", src: doctorPulse, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx("img", { src: doctorPulseSkills, alt: "" }) }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Assembly - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Consumes 1 nearby War Machine, Electro Robot, or Shock Robot to create a drone part. From level 1: Max 2 drones. From level 6: Max 4 drones." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Drone Operation - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Basic attacks are carried out by each drone, dealing 1000% Magic DMG to enemies within range." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Maximum Power - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 10% chance to unleash maximum power, dealing 7000% Magic DMG within range." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Overheat - Ult" }) }),
      /* @__PURE__ */ jsx("p", { children: "Boosts ATK SPD of drones by 250% and DMG by 100% for 10s. When the effect ends, drones self-destruct dealing 12000% Magic DMG within range." }),
      /* @__PURE__ */ jsx("p", { children: "From level 12: Damage increases by +10% for each additional drone." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Dr. Pulse is summoned once you charge a total of 10,000 energy with Pulse Generator. Putting him next to your stun setup will practically guarantee summoning Dr. Pulse. Note that creating his drones consumes your stun robots. You want to make sure that you have surplus stuns on the board before consuming any to form drones. You will lose the game without stuns." })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Top Vayne", imgSrc: topVayne, children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: topVayne, alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Top Vayne is a single target physical damage boss killer. Vayne and Ato have a very strong synergy overall, going both ways. If you play a bunch of Vaynes, Ato will ascend to Chrono Ato very quickly. If you play a bunch of Atos, Vayne can stay in ult form much longer." }),
      /* @__PURE__ */ jsxs("h3", { children: [
        "Mythic Form",
        /* @__PURE__ */ jsx(
          "img",
          {
            class: "mini",
            src: "../pics/unit/mythics/Vayne.png",
            alt: ""
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Mythic Vayne staying in ult form is the most important thing. Since doing this now requires Ato instead of Kitty Mage, Ato is required when using Vayne as your boss killer. Unless you spam Atos, you can't use Vayne to kill bosses the way she was intended. However, there are some benefits to this limitation." }),
      /* @__PURE__ */ jsx("p", { children: "Rocket Chu has always been one of the strongest mythics in the entire game. This was before the game had Ato buffing his damage and his cooldown. Now that Ato is in the game, Chu can ult constantly. Immortal Bomba is also much stronger with Ato. Now, all these things are in sync since they all benefit from Ato. While Vayne can't reliably perma ult anymore, the overall improved synergy makes using her easier." }),
      /* @__PURE__ */ jsxs("h3", { children: [
        "Immortal Form",
        /* @__PURE__ */ jsx("img", { class: "mini", src: topVayne, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Her Immortal Form is very strong. Unlike Vayne, Top Vayne doesn't rely on tumbling. Her main sources of damage at level 6 are Golden Arrow and Rupture Arrow. Golden Arrow causes every 3rd attack on the same target to do 7000% damage (70x damage). Rupture Arrow triggers every 15 attacks, and causes a 5 second damage over time effect. This DoT effect causes 3300% dmg every half a second for those 5 seconds. This is the equivalent of 33,000% dmg overall, or 330x damage. Rupture Arrow also does an additional 10% damage for each point of the targets DEF stat. In God Mode this would be an extra 1750% damage every half second, or 17,500% over 5 seconds, an additional 175x damage. Adding both together this would be 50,500%, or 505x damage." }),
      /* @__PURE__ */ jsx("p", { children: "As far as Arrow Explosion, I've seen underwhelming results from this skill. Considering every 3rd attack from Vayne does 7000% damage, Arrow Explosion only stacking 1000% damage per attack that can be triggered later doesn't sound particularly impressive. Especially considering how strong Rupture Arrow is. Her ult does influence the viability here. Her attack speed increases up to 150% when using her Ult, and each attack stacks two explosive arrows instead of one. Considering that Her ult improves attack speed even more at level 12, this could be a stronger ability then but considering this also benefits Golden Arrow and Rupture Arrow, it seems comparatively underwhelming. This potential is also limited behind a high amount of Ato spam. Theoretically, the best strategy to maximize this ult would be to only run a single Vayne, in hopes of spamming even more Atos in place of other would-be Vayne's." }),
      /* @__PURE__ */ jsx("p", { children: "Overall, Vayne has a great immortal form. If you don't see huge bursts of damage from Arrow Explosion that's fine - Arrow Explosion appears to be the less powerful abilities. Expect most of your damage to come from Rupture Arrow and Golden Arrow, these are your bread and butter. Pursuing big Arrow Explosion results isn't the reccommended approach, however, after every ult, you should still trigger Arrow Explosion, because of the increased Attack SPD and double stacking, that's when the stacks will be at their peak. Even then, the main damage will be those other two skills, and you should expect only a little extra damage from Arrow Explosion." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx("img", { class: "mini", src: topVayne, alt: "" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx("img", { src: topVayneSkills, alt: "" }) }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Golden Arrow - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "ATK increases by 1000%. Every 3 attacks on the same target deals 7000% Physical DMG." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Arrow Explosion - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Each attack embeds an arrow into the enemy. When Vayne moves, the embedded arrows explode, dealing 1000% Physical DMG per arrow." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Rupture Arrow - Skill " }) }),
      /* @__PURE__ */ jsx("p", { children: "Every 15 attacks, deals 3300% Physical DMG to the target every 0.5s for 5s. Deals an additional 10% damage for each point of the target's DEF." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "End of Days - ULT" }) }),
      /* @__PURE__ */ jsx("p", { children: "ATK SPD gradually increases over 15s, up to 150%, and Arrow Explosion stack gain is doubled." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Top Vayne can be summoned once you have a Vayne use ult 12 times. You can speed this up by getting Vayne's exclusive, and by spamming Atos." })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Super Graviton", children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: "../pics/unit/immortals/Top Vaynee.png", alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Super Graviton is a support guardian. The immortal form is more varied in its crowd control than the mythic form. The stun effect stuns for 0.9s every second for 4s. After factoring in the -50% stun duration from Hard onwards, it will only stun for 0.45s per second each time." }),
      /* @__PURE__ */ jsx("p", { children: "In exchange for the weaker stun, Super Graviton grants a damage boost to your board, slow, and the ult has a suction ability. These work to keep enemies in one spot." }),
      /* @__PURE__ */ jsx("p", { children: "To enforce a secure stunlock, you need to pair Super Graviton with 1-2 mythic Gravitons. The Super Graviton will stun incoming units every second and the Graviton(s) will keep the units stunned due to their long stun duration. This helps you to save unit capacity and/or board space." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx(
          "img",
          {
            class: "mini",
            src: "../pics/unit/immortals/Top Vaynee.png",
            alt: ""
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "../pics/immortal-guide/vayneskillss.webp",
          alt: ""
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Gravity Wave - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Basic attacks deal 150% Magic DMG to enemies in the area." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Electric Field - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 7% chance (12% at level 6) to strike enemies in the area, dealing 5000% Magic DMG. Hit enemies are slowed by 80 for 3s and take 10% increased damage." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Gravity Field - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 11% chance (16% at level 6) to create a Gravity Field that lasts 4s, dealing 1000% Magic DMG every 1s and stunning enemies for 0.9s." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Black Hole - Ult, MP" }) }),
      /* @__PURE__ */ jsx("p", { children: "Creates a Black Hole that pulls in enemies for 4s (6s at level 12), dealing 350% Magic DMG every 0.2s. Explodes on end, dealing 2000% Magic DMG." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Super Graviton can be summoned when Graviton’s Overheat gauge reaches 100. Charging the Overhead gauge requires consuming other Gravitons, with each one increasing the gauge by 15-35 points. So you need to consume 3 to 7 Gravs to summon a Super Graviton, plus one more doing the consuming." }),
      /* @__PURE__ */ jsx("p", { children: "To make the summon cost less prohibitive, the exclusive treasure is crucial as it increases the Overheat gauge charged per Grav consumed. It is highly recommended to get the exclusive treasure to level 6 to make the summon cost only 2 to 4 Gravs instead of 3 to 7. At level 8+, it reduces further to 2 to 3 Gravs." })
    ] }),
    /* @__PURE__ */ jsxs(ToggleSection, { title: "Dark Lord Dragon", children: [
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs", children: /* @__PURE__ */ jsx("img", { src: "../pics/unit/immortals/Top Vaynee.png", alt: "" }) }),
      /* @__PURE__ */ jsx("h2", { children: "Playstyle" }),
      /* @__PURE__ */ jsx("p", { children: "Dark Lord Dragon is a Magical DPS guardian. He is a solid damage contributor and is especially good at clearing waves. Summon conditions are fairly straightforward if you can get enough Eagles early on to give the eggs time to hatch, which makes him one of the more consistent immortals to obtain." }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Skills",
        /* @__PURE__ */ jsx(
          "img",
          {
            class: "mini",
            src: "../pics/unit/immortals/Top Vaynee.png",
            alt: ""
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { class: "two-centered-imgs-flat-height", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "../pics/immortal-guide/vayneskillss.webp",
          alt: ""
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Ultimate Lifeform - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "ATK increases by 40% for each Animal-type Guardian on the field." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Flame Mark - Passive" }) }),
      /* @__PURE__ */ jsx("p", { children: "Each skill attack leaves a Flame Mark on the target. When the marks stack up to 5, they explode, dealing 2500% Magic DMG. At level 6, the explosion transfers 5 Flame Marks to nearby enemies with a cooldown of 10s." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Flame Shot - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 8% chance to deal 35000% Magic DMG to all enemies in range." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Flame Release - Skill" }) }),
      /* @__PURE__ */ jsx("p", { children: "Has a 11% chance to release flames, dealing 16000% Magic DMG to all enemies in range 2 times." }),
      /* @__PURE__ */ jsx("p", { className: "margin-bottom: 0", children: /* @__PURE__ */ jsx("b", { children: "Inferno - Ult, MP" }) }),
      /* @__PURE__ */ jsx("p", { children: "The Dragon erupts the ground, dealing 35000% Magic DMG to all enemies in range. The area scorches for 5s (7.5s at level 12), dealing 2000% Magic DMG every 0.5s." }),
      /* @__PURE__ */ jsx("h2", { children: "How to Summon" }),
      /* @__PURE__ */ jsx("p", { children: "Dark Lord Dragon can be summoned when you have 1 Drain and 1 Dragon on the board. The two main obstacles to summoning him is getting 8 Eagles to merge a Great Egg (to awaken Drain) and a Dragon Egg (to awaken a Dragon) and waiting for the eggs to hatch." }),
      /* @__PURE__ */ jsx("p", { children: "People generally suggest forming the Dragon Egg first to provide some DPS early on. However, if you are lucky with Eagles in your epic roulette, you can consider going for Drain first." })
    ] })
  ] });
}
const handle$6 = {
  title: "Immortal Guardians"
};
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ImmortalGuardians,
  handle: handle$6
}, Symbol.toStringTag, { value: "Module" }));
function ChecklistItem({
  title,
  inGameUrl,
  mapUrl,
  id,
  checkedItems,
  toggleItem,
  hide,
  description
}) {
  const [picsVisible, setPicsVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  return /* @__PURE__ */ jsx(
    "li",
    {
      className: `transition-all duration-400 ${hide && "scale-y-0" || "scale-y-100"}`,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            backgroundImage: `url(${inGameUrl})`
          },
          className: `bg-no-repeat text-white bg-neutral-900 shadow-black transition-all duration-400 ${hide && "delay-100"} box-border w-full rounded-md px-2 min-h-0 overflow-hidden flex flex-col gap-2 ${hide && "h-0 py-0 shadow-none" || !picsVisible && "h-11 py-2 mb-4 shadow-md bg-cover bg-center" || "h-115 py-2 mb-4 shadow-md bg-position-[center_100%]"} relative`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    className: "accent-neutral-200 bg-neutral-200",
                    id: "checkbox-" + title,
                    name: "checkbox" + title,
                    type: "checkbox",
                    checked: checkedItems.includes(id),
                    onChange: () => toggleItem(id)
                  }
                ),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: `flex px-2.5 rounded-lg flex-1 transition-all items-center ml-2 ${picsVisible ? "bg-black/70" : "bg-black/20"}`,
                    children: title
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setPicsVisible(!picsVisible),
                  className: "text-amber-50 bg-neutral-600 rounded px-2 py-0.5 ml-auto w-16",
                  children: picsVisible && "Hide" || "Show"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "img",
              {
                className: `object-cover h-45 w-80 justify-center transition-all duration-400 mx-auto ${picsVisible && "opacity-100" || "opacity-0"} ${descriptionVisible ? "translate-x-[-150%]" : ""}`,
                src: inGameUrl,
                alt: ""
              }
            ),
            /* @__PURE__ */ jsx(
              "img",
              {
                className: `object-cover h-45 w-80 justify-center transition-all duration-400 mx-auto ${picsVisible && "opacity-100" || "opacity-0"} ${descriptionVisible ? "translate-x-[-150%]" : ""}`,
                src: mapUrl,
                alt: ""
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                className: `absolute transition-all rounded-lg duration-400 top-12 box-border p-4 h-91 w-80 left-1/2 bg-black/70
                        ${picsVisible ? "opacity-100" : "opacity-0"}
                        ${descriptionVisible ? "translate-x-[-50%]" : "translate-x-100"}`,
                children: description
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setDescriptionVisible(!descriptionVisible),
                className: `text-amber-50 bg-neutral-600 rounded px-2 py-0.5 transition-all mx-auto w-40`,
                children: descriptionVisible && "Show Images" || "Show Description"
              }
            )
          ]
        }
      )
    }
  );
}
function PlaceholderMenu() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("ul", { className: "flex flex-col gap-2 place-content-center h-20", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", children: "Main" }),
      /* @__PURE__ */ jsx(Link, { to: "/flea-guide", children: "Flea Guide" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function Checklist({ checklistId }) {
  const { currentAPI: currentAPI2 } = usePage();
  const [checkedItems, setCheckedItems] = useState(() => {
    const checkStored = JSON.parse(localStorage.getItem("checkedItems"));
    const stored = Array.isArray(checkStored) ? checkStored : [];
    return stored;
  });
  const [checklistItems, setChecklistItems] = useState([]);
  const [showAll, setShowAll] = useState(() => {
    const stored = localStorage.getItem("showAll");
    return stored == "true";
  });
  useEffect(() => {
    fetch(currentAPI2 + "/checklists/" + checklistId).then((response) => response.json()).then((result) => setChecklistItems(result));
  }, [checklistId]);
  function toggleItem(id) {
    let newItems = [...checkedItems];
    if (newItems.includes(id)) {
      newItems = newItems.filter((item) => item != id);
    } else {
      newItems.push(id);
    }
    localStorage.setItem("checkedItems", JSON.stringify(newItems));
    setCheckedItems(newItems);
  }
  function toggleShowAll() {
    setShowAll(!showAll);
    localStorage.setItem("showAll", !showAll);
  }
  function filterAndSortChecklist() {
    let list = checklistItems;
    list = list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }
  return (
    //Checklist
    /* @__PURE__ */ jsxs(
      "div",
      {
        id: "checklist-" + checklistId,
        className: "flex flex-col bg-neutral-800 h-full",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "sticky top-0 bg-neutral-900 flex justify-between px-4 py-2 items-center shadow-lg", children: [
            /* @__PURE__ */ jsxs("p", { className: "", children: [
              "Checklist -",
              " ",
              Object.values(checkedItems).filter((checked) => checked).length,
              "/",
              checklistItems.length,
              " Fleas"
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => toggleShowAll(),
                className: `self-center text-amber-50 bg-neutral-600 rounded px-2 py-0.5 transition-all overflow-hidden text-nowrap ${showAll ? "w-40" : "w-30"}`,
                children: showAll ? "Show Remaining" : "Show All"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(PlaceholderMenu, {}),
          /* @__PURE__ */ jsx("ul", { className: "w-full p-4 pt-2 pb-0 overflow-y-auto ", children: filterAndSortChecklist().map((item) => {
            const hide = checkedItems.includes(item.id) && !showAll;
            return /* @__PURE__ */ jsx(
              ChecklistItem,
              {
                title: item.title,
                id: item.id,
                inGameUrl: item.imageOne,
                mapUrl: item.imageTwo,
                toggleItem,
                checkedItems,
                hide,
                description: item.description
              },
              item.id
            );
          }) })
        ]
      }
    )
  );
}
const handle$5 = {
  title: "Flea Guide"
};
const fleaGuide = UNSAFE_withComponentProps(function FleaGuide() {
  return /* @__PURE__ */ jsx(Checklist, {
    checklistId: 1
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: fleaGuide,
  handle: handle$5
}, Symbol.toStringTag, { value: "Module" }));
function ProtectedRoute({ children, requiredRole = "USER" }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const roles = { USER: 0, EDITOR: 1, ADMIN: 2 };
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      if (roles[user?.role] < roles[requiredRole]) {
        navigate("/access-denied");
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, requiredRole]);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "w-full flex items-center justify-center mt-20", children: /* @__PURE__ */ jsx("p", { className: "text-(--text-color)", children: "Loading..." }) });
  }
  if (!isAuthenticated) {
    return null;
  }
  return children;
}
const pencilIcon = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M8.29289%203.70711L1%2011V15H5L12.2929%207.70711L8.29289%203.70711Z'%20fill='%23794e3b'/%3e%3cpath%20d='M9.70711%202.29289L13.7071%206.29289L15.1716%204.82843C15.702%204.29799%2016%203.57857%2016%202.82843C16%201.26633%2014.7337%200%2013.1716%200C12.4214%200%2011.702%200.297995%2011.1716%200.828428L9.70711%202.29289Z'%20fill='%23794e3b'/%3e%3c/svg%3e";
const cancelIcon = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20viewBox='0%200%20600%20600'%20version='1.1'%20id='svg9724'%20sodipodi:docname='cancel-circle.svg'%20inkscape:version='1.2.2%20(1:1.2.2+202212051550+b0a8486541)'%20width='600'%20height='600'%20xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape'%20xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:svg='http://www.w3.org/2000/svg'%3e%3cdefs%20id='defs9728'%20/%3e%3csodipodi:namedview%20id='namedview9726'%20pagecolor='%23ffffff'%20bordercolor='%23666666'%20borderopacity='1.0'%20inkscape:showpageshadow='2'%20inkscape:pageopacity='0.0'%20inkscape:pagecheckerboard='0'%20inkscape:deskcolor='%23d1d1d1'%20showgrid='true'%20inkscape:zoom='0.42059315'%20inkscape:cx='139.08928'%20inkscape:cy='495.72847'%20inkscape:window-width='1920'%20inkscape:window-height='1009'%20inkscape:window-x='0'%20inkscape:window-y='1080'%20inkscape:window-maximized='1'%20inkscape:current-layer='g10449'%20showguides='true'%3e%3cinkscape:grid%20type='xygrid'%20id='grid9972'%20originx='0'%20originy='0'%20/%3e%3c/sodipodi:namedview%3e%3cg%20id='g10449'%20transform='matrix(0.95173205,0,0,0.95115787,13.901174,12.168794)'%20style='stroke-width:1.05103'%3e%3cg%20id='path10026'%20inkscape:transform-center-x='-0.59233046'%20inkscape:transform-center-y='-20.347403'%20transform='matrix(1.3807551,0,0,1.2700888,273.60014,263.99768)'%20/%3e%3cg%20id='g11314'%20transform='matrix(1.5092301,0,0,1.3955555,36.774048,-9.4503933)'%20style='stroke-width:50.6951'%20/%3e%3cpath%20style='color:%23794e3b;fill:%23794e3b;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none;paint-order:stroke%20fill%20markers'%20d='m%20300.60937,-12.792969%20c%20-173.60599,0%20-315.214839,141.724839%20-315.214839,315.404299%200,173.67945%20141.608849,315.40429%20315.214839,315.40429%20173.606,0%20315.21485,-141.72484%20315.21485,-315.40429%200,-173.67946%20-141.60885,-315.404299%20-315.21485,-315.404299%20z%20m%200,84.082031%20c%20128.13278,10e-7%20231.13086,103.052738%20231.13086,231.322268%200,128.26952%20-102.99808,231.32226%20-231.13086,231.32226%20C%20172.4766,533.93359%2069.476562,430.88085%2069.476562,302.61133%2069.476563,174.3418%20172.4766,71.289062%20300.60937,71.289062%20Z'%20id='path390'%20/%3e%3cpath%20style='color:%23794e3b;fill:%23794e3b;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none'%20d='M%20416.16211,144.93164%20A%2042.041401,42.041401%200%200%200%20386.4375,157.25391%20L%20155.30469,388.53125%20a%2042.041401,42.041401%200%200%200%200.0195,59.45703%2042.041401,42.041401%200%200%200%2059.45508,-0.0195%20L%20445.91211,216.69141%20a%2042.041401,42.041401%200%200%200%20-0.0195,-59.45704%2042.041401,42.041401%200%200%200%20-29.73047,-12.30273%20z'%20id='path446'%20/%3e%3cpath%20style='color:%23794e3b;fill:%23794e3b;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none'%20d='m%20185.05664,144.93164%20a%2042.041401,42.041401%200%200%200%20-29.73242,12.30273%2042.041401,42.041401%200%200%200%20-0.0195,59.45704%20L%20386.4375,447.96875%20a%2042.041401,42.041401%200%200%200%2059.45508,0.0195%2042.041401,42.041401%200%200%200%200.0195,-59.45703%20L%20214.7793,157.25391%20a%2042.041401,42.041401%200%200%200%20-29.72266,-12.32227%20z'%20id='path446-3'%20/%3e%3c/g%3e%3c/svg%3e";
const saveIcon = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M18.1716%201C18.702%201%2019.2107%201.21071%2019.5858%201.58579L22.4142%204.41421C22.7893%204.78929%2023%205.29799%2023%205.82843V20C23%2021.6569%2021.6569%2023%2020%2023H4C2.34315%2023%201%2021.6569%201%2020V4C1%202.34315%202.34315%201%204%201H18.1716ZM4%203C3.44772%203%203%203.44772%203%204V20C3%2020.5523%203.44772%2021%204%2021L5%2021L5%2015C5%2013.3431%206.34315%2012%208%2012L16%2012C17.6569%2012%2019%2013.3431%2019%2015V21H20C20.5523%2021%2021%2020.5523%2021%2020V6.82843C21%206.29799%2020.7893%205.78929%2020.4142%205.41421L18.5858%203.58579C18.2107%203.21071%2017.702%203%2017.1716%203H17V5C17%206.65685%2015.6569%208%2014%208H10C8.34315%208%207%206.65685%207%205V3H4ZM17%2021V15C17%2014.4477%2016.5523%2014%2016%2014L8%2014C7.44772%2014%207%2014.4477%207%2015L7%2021L17%2021ZM9%203H15V5C15%205.55228%2014.5523%206%2014%206H10C9.44772%206%209%205.55228%209%205V3Z'%20fill='%23794e3b'/%3e%3c/svg%3e";
function PagesItem({
  page,
  pageIndex,
  setPages,
  deletePage,
  pages,
  updatePageTitle,
  updatePageSlug
}) {
  const [inputText, setInputText] = useState("");
  const [slugInputText, setSlugInputText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [titleEditMode, setTitleEditMode] = useState(false);
  const [slugEditMode, setSlugEditMode] = useState(false);
  const slug = page.slug;
  const { gameData } = useRouteLoaderData("main");
  gameData?.slug;
  const pageId = page.id;
  const slugActual = "/" + page.slug;
  async function updatePageItemSlug() {
    await updatePageSlug(pageId, slugInputText, pageIndex);
    setSlugEditMode(!slugEditMode);
  }
  async function updatePageItemTitle() {
    await updatePageTitle(pageId, inputText, pageIndex);
    setTitleEditMode(!titleEditMode);
  }
  return /* @__PURE__ */ jsxs(
    "li",
    {
      id: "page-item-" + pageIndex,
      className: "mt-4 w-full\n                md:px-6 pt-4 md:p-4\n                flex flex-col md:flex-row\n                items-center justify-center\n                bg-[#e2d2b9] rounded-lg shadow-lg\n                gap-4",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex flex-col w-full gap-4 px-6 md:px-0",
            id: "details-container-" + pageIndex,
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  id: "title-container-" + pageIndex,
                  className: "flex justify-stretch items-center",
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "m-0 p-0 w-12", children: "Title:" }),
                    titleEditMode ? (
                      // title edit mode
                      /* @__PURE__ */ jsxs("form", { action: "", className: "w-full flex gap-2", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            className: "bg-(--red-brown) min-w-0 w-full px-2 text-white box-border rounded flex-1 max-w-100 ",
                            type: "text",
                            value: inputText,
                            onChange: (e) => setInputText(e.target.value)
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            className: "ml-auto md:ml-0 text-amber-50 h-[1.5em] md:h-[1.1em] self-center rounded",
                            type: "button",
                            onClick: (e) => {
                              e.preventDefault();
                              setTitleEditMode(!titleEditMode);
                            },
                            children: /* @__PURE__ */ jsx(
                              "img",
                              {
                                src: cancelIcon,
                                alt: "Edit Slug",
                                className: " w-full h-full"
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            className: " md:ml-0 text-amber-50 h-[1.5em] md:h-[1.1em] self-center rounded",
                            type: "submit",
                            onClick: (e) => {
                              e.preventDefault();
                              updatePageItemTitle();
                            },
                            children: /* @__PURE__ */ jsx(
                              "img",
                              {
                                src: saveIcon,
                                alt: "Edit Slug",
                                className: " w-full h-full"
                              }
                            )
                          }
                        )
                      ] })
                    ) : (
                      // title view mode
                      /* @__PURE__ */ jsxs(Fragment$1, { children: [
                        /* @__PURE__ */ jsx("p", { className: "mb-0.5", children: page.title }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            className: "ml-auto md:ml-4 text-amber-50 h-[1.5em] md:h-[1.1em] self-center rounded",
                            type: "submit",
                            onClick: (e) => {
                              e.preventDefault();
                              setInputText(page.title);
                              setTitleEditMode(!titleEditMode);
                            },
                            children: /* @__PURE__ */ jsx(
                              "img",
                              {
                                src: pencilIcon,
                                alt: "Edit Slug",
                                className: " w-full h-full"
                              }
                            )
                          }
                        )
                      ] })
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  id: "slug-container-" + pageIndex,
                  className: "flex justify-stretch w-full items-center",
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "w-12", children: "url: " }),
                    slugEditMode ? (
                      // slug edit mode
                      /* @__PURE__ */ jsxs("form", { action: "", className: "w-full flex gap-2", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            id: "slug-input-" + pageIndex,
                            className: "bg-(--red-brown) min-w-0 w-full px-2 text-white box-border rounded flex-1 max-w-100 ",
                            type: "text",
                            value: slugInputText,
                            onChange: (e) => setSlugInputText(e.target.value)
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            id: "slug-cancel-" + pageIndex,
                            className: "ml-auto md:ml-0 text-amber-50 h-[1.5em] md:h-[1.1em] self-center rounded",
                            type: "button",
                            onClick: (e) => {
                              e.preventDefault();
                              setSlugEditMode(!slugEditMode);
                            },
                            children: /* @__PURE__ */ jsx(
                              "img",
                              {
                                src: cancelIcon,
                                className: " w-full h-full"
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            id: "slug-save-" + pageIndex,
                            className: " md:ml-0 text-amber-50 h-[1.5em] md:h-[1.1em] self-center rounded",
                            type: "submit",
                            onClick: (e) => {
                              e.preventDefault();
                              updatePageItemSlug();
                            },
                            children: /* @__PURE__ */ jsx(
                              "img",
                              {
                                src: saveIcon,
                                className: " w-full h-full"
                              }
                            )
                          }
                        )
                      ] })
                    ) : (
                      // slug view mode
                      /* @__PURE__ */ jsxs(Fragment$1, { children: [
                        /* @__PURE__ */ jsx("p", { className: "mb-0.5", children: slug }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            id: "slug-edit-button-" + pageIndex,
                            className: "ml-auto md:ml-4 text-amber-50 h-[1.5em] md:h-[1.1em] self-center rounded",
                            type: "submit",
                            onClick: (e) => {
                              e.preventDefault();
                              setSlugInputText(page.slug);
                              setSlugEditMode(!slugEditMode);
                            },
                            children: /* @__PURE__ */ jsx(
                              "img",
                              {
                                src: pencilIcon,
                                className: " w-full h-full"
                              }
                            )
                          }
                        )
                      ] })
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            id: "button-container-" + pageIndex,
            className: (
              //"my-2 divide-x divide-x-reverse divide-(--outline-brown)/25 md:border-t-0 flex flex-row-reverse md:flex-col justify-between md:items-end h-7 md:h-full md:gap-4 "
              "my-2 divide-x divide-x-reverse divide-(--outline-brown)/25 md:border-t-0 flex flex-row-reverse md:flex-col w-full justify-between md:items-end h-7 md:h-full md:gap-4 "
            ),
            children: [
              page.slug ? /* @__PURE__ */ jsx(
                Link,
                {
                  className: "flex items-center justify-center w-full h-full md:text-amber-50 md:bg-(--primary) md:w-30 md:rounded md:px-2 md:py-0.5 text-center",
                  to: slugActual,
                  children: "View Page"
                }
              ) : /* @__PURE__ */ jsx(
                "button",
                {
                  className: "flex items-center justify-center w-full h-full md:text-amber-50 md:bg-(--primary) md:w-30 md:rounded md:px-2 md:py-0.5 text-center",
                  onClick: () => alert("Page must have url before it can be edited"),
                  children: "View Page"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: async () => {
                    await deletePage(page.id);
                    const newPages = [...pages];
                    newPages.splice(pageIndex, 1);
                    setPages(newPages);
                  },
                  className: "text-red-700/70 flex items-center justify-center w-full h-full md:text-amber-50 md:bg-(--primary) md:w-30 md:rounded md:px-2 md:py-0.5 text-center",
                  children: "Delete Page"
                }
              )
            ]
          }
        )
      ]
    },
    page.id
  );
}
function PageManager() {
  const [pages, setPages] = useState([]);
  const { gameData, sectionsMap } = useRouteLoaderData("main");
  const gameId = gameData?.id;
  const [title, setTitleInput] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  useEffect(() => {
    if (!gameId) {
      fetch(currentAPI + "/pages", {
        credentials: "include"
      }).then((response) => response.json()).then((result) => setPages(result));
      return;
    } else {
      fetch(currentAPI + "/games/" + gameId + "/pages", {
        credentials: "include"
      }).then((response) => response.json()).then((result) => setPages(result));
      return;
    }
  }, [gameId]);
  async function createPage() {
    if (!title?.trim()) {
      console.log("Error - title cannot be empty");
      return;
    }
    try {
      const body = { title };
      if (selectedSection && selectedSection !== "none" && selectedSection !== "" && !isNaN(Number(selectedSection))) {
        body.sectionId = Number(selectedSection);
      }
      const response = await fetch(
        currentAPI + "/games/" + gameId + "/pages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(body)
        }
      );
      const newPage = await response.json();
      setPages([...pages, newPage]);
      setTitleInput("");
      setSelectedSection("");
    } catch (err) {
      console.error("Error", err);
    }
  }
  function deletePage(id) {
    if (!+id) return;
    fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify()
    });
  }
  async function updatePageTitle(id, title2, index) {
    if (!+id) return;
    await fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ title: title2 })
    });
    const newPages = [...pages];
    newPages[index].title = title2;
    setPages(newPages);
  }
  async function updatePageSlug(id, slug, index) {
    if (!+id) return;
    await fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ slug })
    });
    const newPages = [...pages];
    newPages[index].slug = slug;
    setPages(newPages);
  }
  async function updatePageSort(id, sort, index) {
    if (!+id) return;
    await fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ sort })
    });
    const newPages = [...pages];
    newPages[index].sort = sort;
    setPages(newPages);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-between items-center mx-auto gap-2", children: /* @__PURE__ */ jsxs("form", { className: "flex gap-2 items-center flex-col md:flex-row ", children: [
      /* @__PURE__ */ jsx("h1", { children: "Pages:" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "bg-(--red-brown) text-white px-2 rounded",
          onChange: (e) => setTitleInput(e.target.value),
          value: title,
          placeholder: "Page Title"
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "bg-(--red-brown) text-white px-2 py-1 rounded",
          value: selectedSection,
          onChange: (e) => setSelectedSection(e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select section (optional)" }),
            Array.from(sectionsMap?.values?.() || []).map(
              (section) => /* @__PURE__ */ jsx("option", { value: section.id, children: section.title }, section.id)
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          onClick: (e) => {
            e.preventDefault();
            createPage();
          },
          className: "text-amber-50 bg-(--primary) px-2 py-1 rounded",
          children: "Create Page"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("ul", { id: "pagemanager-list", className: "m-2", children: pages.map((page, pageIndex) => {
      return /* @__PURE__ */ jsx(
        PagesItem,
        {
          pageIndex,
          page,
          pages,
          setPages,
          deletePage,
          updatePageTitle,
          updatePageSlug,
          updatePageSort
        },
        page.id
      );
    }) })
  ] });
}
const handle$4 = {
  title: "Page Manager"
};
const pageManager = UNSAFE_withComponentProps(function PageManagerRoute() {
  return /* @__PURE__ */ jsx(ProtectedRoute, {
    requiredRole: "ADMIN",
    children: /* @__PURE__ */ jsx(PageManager, {
      isAdmin: true
    })
  });
});
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: pageManager,
  handle: handle$4
}, Symbol.toStringTag, { value: "Module" }));
function GameItem({ title, slug, id }) {
  const [slugInput, setSlugInput] = useState(slug);
  const [editMode, setEditMode] = useState(false);
  function toggleEditMode() {
    setEditMode(!editMode);
  }
  function updateGameSlug() {
    console.log("changing game slug");
    fetch(currentAPI + "/games/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ slug: slugInput, title })
    });
  }
  return /* @__PURE__ */ jsxs("li", { className: "mt-4 gap-2 w-full flex items-center", children: [
    /* @__PURE__ */ jsx("div", { children: title }),
    !editMode && /* @__PURE__ */ jsx("div", { className: "ml-auto", children: slug }),
    editMode && /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        name: "",
        value: slugInput,
        className: "bg-(--red-brown) min-w-0 px-2 text-white box-border rounded flex-1 max-w-100 mr-2 ml-auto",
        onChange: (e) => setSlugInput(e.target.value)
      }
    ),
    !editMode && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => toggleEditMode(),
        className: "mr-2 text-amber-50 bg-(--primary) w-30 rounded px-2 py-0.5",
        children: "Change Url"
      }
    ),
    editMode && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => updateGameSlug(),
          className: "mr-2 text-amber-50 bg-(--primary) w-30 rounded px-2 py-0.5",
          children: "Save"
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "" })
    ] })
  ] });
}
function GameManager() {
  const [games, setGames] = useState([]);
  const [titleInput, setTitleInput] = useState("");
  useEffect(() => {
    fetch(currentAPI + "/games/").then((response) => response.json()).then((result) => setGames(result));
  }, [currentAPI]);
  async function createGame(title) {
    console.log("Create game");
    if (!title?.trim()) {
      console.log("Error - title cannot be empty");
      return;
    }
    try {
      await fetch(currentAPI + "/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ title })
      });
    } catch (err) {
      console.error("Error", err);
      return;
    }
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-between items-center mx-auto gap-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "", children: "Games:" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "title",
          value: titleInput,
          onChange: (e) => setTitleInput(e.target.value),
          className: "bg-(--red-brown) min-w-0 text-white px-2 box-border rounded ml-auto",
          placeholder: "Game Title"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          onClick: (e) => {
            e.preventDefault();
            createGame(titleInput);
          },
          className: "text-amber-50 bg-(--primary) w-38 rounded px-2 py-0.5",
          children: "Add Game"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("ul", { children: games.map((game) => {
      return /* @__PURE__ */ jsx(
        GameItem,
        {
          title: game.title,
          slug: game.slug,
          id: game.id
        },
        game.id
      );
    }) })
  ] });
}
const handle$3 = {
  title: "Game Manager"
};
const gameManager = UNSAFE_withComponentProps(function GameManagerRoute() {
  return /* @__PURE__ */ jsx(ProtectedRoute, {
    requiredRole: "ADMIN",
    children: /* @__PURE__ */ jsx(GameManager, {
      isAdmin: true
    })
  });
});
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: gameManager,
  handle: handle$3
}, Symbol.toStringTag, { value: "Module" }));
function NavigationPanel() {
  const [, forceRender] = useState(0);
  const { gameData, sectionsMap } = useRouteLoaderData("main");
  if (!gameData || !sectionsMap) {
    return /* @__PURE__ */ jsx("div", { children: "Loading navigation data..." });
  }
  const gameId = gameData?.id;
  const [unsectionedPages, setUnsectionedPages] = useState([]);
  useEffect(() => {
    if (!gameId) return;
    fetch(currentAPI + "/games/" + gameId + "/pages").then((res) => res.json()).then(
      (pages) => setUnsectionedPages(pages.filter((p) => !p.sectionId))
    );
  }, [gameId]);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionName, setSectionName] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSection, setNewPageSection] = useState("");
  const [editingPage, setEditingPage] = useState(null);
  const [pageName, setPageName] = useState("");
  const [detailPage, setDetailPage] = useState(null);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailSlug, setDetailSlug] = useState("");
  const { theme, setTheme } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [savedTheme, setSavedTheme] = useState(null);
  const [expandedSections, setExpandedSections] = useState(/* @__PURE__ */ new Set());
  useEffect(() => {
    const all = getSortedSections().map((s) => s.id);
    setExpandedSections(new Set(all));
  }, []);
  function toggleSection(id) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAllSections() {
    const all = getSortedSections().map((s) => s.id);
    const allExp = all.every((id) => expandedSections.has(id));
    setExpandedSections(allExp ? /* @__PURE__ */ new Set() : new Set(all));
  }
  function allExpanded() {
    const all = getSortedSections();
    return all.length > 0 && all.every((s) => expandedSections.has(s.id));
  }
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [draggedPage, setDraggedPage] = useState(null);
  const [dragOverPage, setDragOverPage] = useState(null);
  const [openQuickAdd, setOpenQuickAdd] = useState(null);
  const quickAddRef = useRef(null);
  useEffect(() => {
    if (!openQuickAdd) return;
    function handleClickOutside(e) {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
        setOpenQuickAdd(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openQuickAdd]);
  const getSortedSections = () => {
    return Array.from(sectionsMap.values()).sort(
      (a, b) => a.order - b.order
    );
  };
  const getSortedPages = (section) => {
    return [...section.pages].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  };
  async function createSection() {
    if (!newSectionName.trim()) {
      alert("Section name cannot be empty");
      return;
    }
    try {
      const sections = getSortedSections();
      const response = await fetch(currentAPI + "/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          title: newSectionName,
          gameId,
          order: sections.length
        })
      });
      const newSection = await response.json();
      sectionsMap.set(newSection.id, { ...newSection, pages: [] });
      setNewSectionName("");
      forceRender((x) => x + 1);
    } catch (err) {
      console.error("Failed to create section:", err);
    }
  }
  async function renameSection(id) {
    try {
      await fetch(currentAPI + "/sections/rename/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ title: sectionName })
      });
      sectionsMap.get(id).title = sectionName;
      setEditingSection(null);
      forceRender((x) => x + 1);
    } catch (err) {
      console.error("Failed to rename section:", err);
    }
  }
  async function deleteSection(id) {
    try {
      await fetch(currentAPI + "/sections/delete/" + id, {
        method: "DELETE",
        credentials: "include"
      });
      sectionsMap.delete(id);
      forceRender((x) => x + 1);
    } catch (err) {
      console.error("Failed to delete section:", err);
    }
  }
  async function reorderSections(newOrder) {
    try {
      await fetch(currentAPI + "/sections/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          gameId,
          sectionOrder: newOrder
        }),
        credentials: "include"
      });
      newOrder.forEach((id, index) => {
        const section = sectionsMap.get(id);
        if (section) {
          section.order = index;
        }
      });
      forceRender((x) => x + 1);
    } catch (err) {
      console.error("Failed to reorder sections:", err);
    }
  }
  async function reorderPages(sectionId, newOrder) {
    try {
      await fetch(currentAPI + "/games/" + gameId + "/pages/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          sectionId,
          pageOrder: newOrder
        })
      });
      const section = sectionsMap.get(sectionId);
      if (section) {
        newOrder.forEach((id, index) => {
          const page = section.pages.find((p) => p.id === id);
          if (page) page.sort = index;
        });
      }
      forceRender((x) => x + 1);
    } catch (err) {
      console.error("Failed to reorder pages:", err);
    }
  }
  function handleSectionDragStart(e, section) {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.4";
  }
  function handleSectionDragEnd(e) {
    e.currentTarget.style.opacity = "1";
    setDraggedSection(null);
    setDragOverSection(null);
  }
  function handleSectionDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  }
  function handleSectionDragEnter(e, section) {
    setDragOverSection(section);
  }
  function handleSectionDrop(e, targetSection) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSection || draggedSection.id === targetSection.id) {
      return;
    }
    const sections = getSortedSections();
    const draggedIndex = sections.findIndex(
      (s) => s.id === draggedSection.id
    );
    const targetIndex = sections.findIndex(
      (s) => s.id === targetSection.id
    );
    const reordered = [...sections];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    const newOrder = reordered.map((s) => s.id);
    reorderSections(newOrder);
    setDraggedSection(null);
    setDragOverSection(null);
  }
  function handlePageDragStart(e, page) {
    e.stopPropagation();
    setDraggedPage(page);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.4";
  }
  function handlePageDragEnd(e) {
    e.currentTarget.style.opacity = "1";
    setDraggedPage(null);
    setDragOverPage(null);
  }
  function handlePageDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    return false;
  }
  function handlePageDragEnter(e, page) {
    e.stopPropagation();
    setDragOverPage(page);
  }
  function handlePageDrop(e, targetPage, section) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedPage || draggedPage.id === targetPage.id) {
      return;
    }
    if (draggedPage.sectionId !== targetPage.sectionId) {
      return;
    }
    const pages = getSortedPages(section);
    const draggedIndex = pages.findIndex((p) => p.id === draggedPage.id);
    const targetIndex = pages.findIndex((p) => p.id === targetPage.id);
    const reordered = [...pages];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    const newOrder = reordered.map((p) => p.id);
    reorderPages(section.id, newOrder);
    setDraggedPage(null);
    setDragOverPage(null);
  }
  const touchDraggedSection = useRef(null);
  const touchDraggedPage = useRef(null);
  const touchDraggedPageSection = useRef(null);
  const touchClone = useRef(null);
  function createTouchClone(el, touch) {
    const clone = el.cloneNode(true);
    const rect = el.getBoundingClientRect();
    clone.style.position = "fixed";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.opacity = "0.7";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "9999";
    clone.style.transform = "scale(1.02)";
    document.body.appendChild(clone);
    touchClone.current = clone;
  }
  function removeTouchClone() {
    if (touchClone.current) {
      touchClone.current.remove();
      touchClone.current = null;
    }
  }
  function getElementFromPoint(x, y, excludeEl) {
    if (excludeEl) excludeEl.style.display = "none";
    const el = document.elementFromPoint(x, y);
    if (excludeEl) excludeEl.style.display = "";
    return el;
  }
  function handleSectionTouchStart(e, section) {
    if (editingSection) return;
    touchDraggedSection.current = section;
    const card = e.currentTarget.closest("[data-section-id]");
    createTouchClone(card || e.currentTarget, e.touches[0]);
    if (card) card.style.opacity = "0.4";
  }
  function handleSectionTouchMove(e) {
    if (!touchDraggedSection.current) return;
    const touch = e.touches[0];
    if (touchClone.current) {
      touchClone.current.style.left = touch.clientX - touchClone.current.offsetWidth / 2 + "px";
      touchClone.current.style.top = touch.clientY - 20 + "px";
    }
    const el = getElementFromPoint(
      touch.clientX,
      touch.clientY,
      touchClone.current
    );
    const sectionEl = el?.closest("[data-section-id]");
    if (sectionEl) {
      const id = Number(sectionEl.dataset.sectionId);
      const over = sectionsMap.get(id);
      if (over) setDragOverSection(over);
    }
  }
  function handleSectionTouchEnd(e, currentSection) {
    if (!touchDraggedSection.current) return;
    const card = e.currentTarget.closest("[data-section-id]");
    if (card) card.style.opacity = "1";
    removeTouchClone();
    const touch = e.changedTouches[0];
    const el = getElementFromPoint(touch.clientX, touch.clientY, null);
    const sectionEl = el?.closest("[data-section-id]");
    if (sectionEl) {
      const targetId = Number(sectionEl.dataset.sectionId);
      if (targetId !== touchDraggedSection.current.id) {
        const sections = getSortedSections();
        const draggedIndex = sections.findIndex(
          (s) => s.id === touchDraggedSection.current.id
        );
        const targetIndex = sections.findIndex(
          (s) => s.id === targetId
        );
        const reordered = [...sections];
        const [removed] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, removed);
        reorderSections(reordered.map((s) => s.id));
      }
    }
    touchDraggedSection.current = null;
    setDragOverSection(null);
  }
  function handlePageTouchStart(e, page, section) {
    touchDraggedPage.current = page;
    touchDraggedPageSection.current = section;
    const row = e.currentTarget.closest("[data-page-id]");
    createTouchClone(row || e.currentTarget, e.touches[0]);
    if (row) row.style.opacity = "0.4";
  }
  function handlePageTouchMove(e) {
    if (!touchDraggedPage.current) return;
    const touch = e.touches[0];
    if (touchClone.current) {
      touchClone.current.style.left = touch.clientX - touchClone.current.offsetWidth / 2 + "px";
      touchClone.current.style.top = touch.clientY - 20 + "px";
    }
    const el = getElementFromPoint(
      touch.clientX,
      touch.clientY,
      touchClone.current
    );
    const pageEl = el?.closest("[data-page-id]");
    if (pageEl) {
      const id = Number(pageEl.dataset.pageId);
      const section = touchDraggedPageSection.current;
      const over = section?.pages.find((p) => p.id === id);
      if (over) setDragOverPage(over);
    }
  }
  function handlePageTouchEnd(e) {
    if (!touchDraggedPage.current) return;
    const row = e.currentTarget.closest("[data-page-id]");
    if (row) row.style.opacity = "1";
    removeTouchClone();
    const touch = e.changedTouches[0];
    const el = getElementFromPoint(touch.clientX, touch.clientY, null);
    const pageEl = el?.closest("[data-page-id]");
    if (pageEl) {
      const targetId = Number(pageEl.dataset.pageId);
      const section = touchDraggedPageSection.current;
      if (section && targetId !== touchDraggedPage.current.id) {
        const pages = getSortedPages(section);
        const draggedIndex = pages.findIndex(
          (p) => p.id === touchDraggedPage.current.id
        );
        const targetIndex = pages.findIndex((p) => p.id === targetId);
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const reordered = [...pages];
          const [removed] = reordered.splice(draggedIndex, 1);
          reordered.splice(targetIndex, 0, removed);
          reorderPages(
            section.id,
            reordered.map((p) => p.id)
          );
        }
      }
    }
    touchDraggedPage.current = null;
    touchDraggedPageSection.current = null;
    setDragOverPage(null);
  }
  async function changePageSection(pageId, newSectionId, page = null) {
    if (!pageId) return;
    try {
      await fetch(currentAPI + "/sections/" + pageId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          sectionId: newSectionId === "none" ? null : Number(newSectionId)
        })
      });
      if (newSectionId === "none") {
        if (page?.sectionId) {
          const oldSection = sectionsMap.get(page.sectionId);
          if (oldSection) {
            oldSection.pages = oldSection.pages.filter(
              (p) => p.id !== pageId
            );
          }
        }
        if (page)
          setUnsectionedPages((prev) => [
            ...prev,
            { ...page, sectionId: null }
          ]);
      } else {
        if (page?.sectionId) {
          const oldSection = sectionsMap.get(page.sectionId);
          if (oldSection) {
            oldSection.pages = oldSection.pages.filter(
              (p) => p.id !== pageId
            );
          }
        }
        const section = sectionsMap.get(Number(newSectionId));
        if (section && page) {
          section.pages.push({
            ...page,
            sectionId: Number(newSectionId)
          });
        }
        setUnsectionedPages(
          (prev) => prev.filter((p) => p.id !== pageId)
        );
      }
      forceRender((x) => x + 1);
    } catch (err) {
      console.error("Failed to change page section:", err);
    }
  }
  async function createPage() {
    if (!newPageTitle.trim()) {
      alert("Page title cannot be empty");
      return;
    }
    const body = { title: newPageTitle };
    if (newPageSection) body.sectionId = Number(newPageSection);
    try {
      const res = await fetch(currentAPI + "/games/" + gameId + "/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      const newPage = await res.json();
      if (newPage.sectionId) {
        const section = sectionsMap.get(newPage.sectionId);
        if (section) section.pages.push(newPage);
        forceRender((x) => x + 1);
      } else {
        setUnsectionedPages((prev) => [...prev, newPage]);
      }
      setNewPageTitle("");
      setNewPageSection("");
    } catch (err) {
      console.error("Failed to create page:", err);
    }
  }
  async function deletePage(page) {
    try {
      await fetch(
        currentAPI + "/games/" + gameId + "/pages/by-id/" + page.id,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        }
      );
      if (page.sectionId) {
        const section = sectionsMap.get(page.sectionId);
        if (section)
          section.pages = section.pages.filter(
            (p) => p.id !== page.id
          );
        forceRender((x) => x + 1);
      } else {
        setUnsectionedPages(
          (prev) => prev.filter((p) => p.id !== page.id)
        );
      }
    } catch (err) {
      console.error("Failed to delete page:", err);
    }
  }
  async function renamePage(id) {
    try {
      await fetch(
        currentAPI + "/games/" + gameId + "/pages/by-id/" + id,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: pageName })
        }
      );
      let updated = false;
      for (const section of sectionsMap.values()) {
        const page = section.pages.find((p) => p.id === id);
        if (page) {
          page.title = pageName;
          updated = true;
          break;
        }
      }
      if (!updated) {
        setUnsectionedPages(
          (prev) => prev.map(
            (p) => p.id === id ? { ...p, title: pageName } : p
          )
        );
      } else {
        forceRender((x) => x + 1);
      }
      setEditingPage(null);
    } catch (err) {
      console.error("Failed to rename page:", err);
    }
  }
  useEffect(() => {
    if (detailPage) {
      setDetailTitle(detailPage.title ?? "");
      setDetailSlug(detailPage.slug ?? "");
    }
  }, [detailPage]);
  function openDetailPage(page) {
    setDetailPage(page);
  }
  function openThemeEditor() {
    const current = { ...THEME_DEFAULTS, ...gameData?.theme ?? {} };
    setEditingTheme(current);
    setSavedTheme(current);
    setThemeOpen(true);
  }
  function handleThemeChange(key, value) {
    const next = { ...editingTheme, [key]: value };
    setEditingTheme(next);
    setTheme(next);
  }
  function cancelTheme() {
    setTheme(savedTheme);
    setThemeOpen(false);
    setEditingTheme(null);
  }
  function resetThemeToDefaults() {
    setEditingTheme(THEME_DEFAULTS);
    setTheme(THEME_DEFAULTS);
  }
  async function saveTheme() {
    try {
      await fetch(currentAPI + "/games/" + gameId + "/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingTheme)
      });
      setSavedTheme(editingTheme);
      setThemeOpen(false);
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  }
  async function savePageDetail() {
    const id = detailPage.id;
    const titleChanged = detailTitle !== detailPage.title;
    const slugChanged = detailSlug !== (detailPage.slug ?? "");
    try {
      if (titleChanged) {
        await fetch(
          currentAPI + "/games/" + gameId + "/pages/by-id/" + id,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: detailTitle })
          }
        );
      }
      if (slugChanged) {
        await fetch(
          currentAPI + "/games/" + gameId + "/pages/by-id/" + id,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ slug: detailSlug })
          }
        );
      }
      const updated = {
        ...detailPage,
        title: detailTitle,
        slug: detailSlug
      };
      let foundInSection = false;
      for (const section of sectionsMap.values()) {
        const idx = section.pages.findIndex((p) => p.id === id);
        if (idx !== -1) {
          section.pages[idx] = updated;
          foundInSection = true;
          break;
        }
      }
      if (!foundInSection) {
        setUnsectionedPages(
          (prev) => prev.map((p) => p.id === id ? updated : p)
        );
      } else {
        forceRender((x) => x + 1);
      }
      setDetailPage(updated);
    } catch (err) {
      console.error("Failed to save page detail:", err);
    }
  }
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsx("div", { className: "mt-8 max-w-4xl mb-4 flex justify-end", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: openThemeEditor,
        className: "flex items-center gap-2 bg-(--red-brown) text-white px-4 py-2 rounded cursor-pointer hover:opacity-90",
        children: [
          /* @__PURE__ */ jsx(Palette, { size: 16 }),
          "Game Theme"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mb-4 flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: newSectionName,
          onChange: (e) => setNewSectionName(e.target.value),
          placeholder: "New section name",
          className: "bg-(--red-brown) text-white px-3 py-2 rounded w-full sm:flex-1"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: createSection,
          className: "bg-(--red-brown) text-white px-4 py-2 rounded hover: cursor-pointer w-full sm:w-auto",
          children: "Add Section"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mb-4 flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: newPageTitle,
          onChange: (e) => setNewPageTitle(e.target.value),
          placeholder: "New page title",
          className: "bg-(--red-brown) text-white px-3 py-2 rounded w-full sm:flex-1",
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              createPage();
            }
          }
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: newPageSection,
          onChange: (e) => setNewPageSection(e.target.value),
          className: "bg-(--red-brown) text-white px-3 py-2 rounded w-full sm:w-auto",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "No section" }),
            getSortedSections().map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.title }, s.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: createPage,
          className: "bg-(--red-brown) text-white px-4 py-2 rounded hover:cursor-pointer w-full sm:w-auto",
          children: "Add Page"
        }
      )
    ] }),
    getSortedSections().length > 0 && /* @__PURE__ */ jsx("div", { className: "max-w-4xl mb-2 flex justify-center sm:justify-start", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: toggleAllSections,
        className: "text-sm text-(--text-color) hover:text-(--accent-text) bg-(--red-brown-trans) hover:bg-(--primary) px-3 py-1 rounded transition-colors cursor-pointer font-semibold",
        children: allExpanded() ? "Collapse All" : "Expand All"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl w-full", children: [
      /* @__PURE__ */ jsxs("table", { className: "m-0 w-full border border-(--outline) hidden sm:table", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-(--primary)", children: [
          /* @__PURE__ */ jsx("th", { className: "p-2 text-left w-8" }),
          /* @__PURE__ */ jsx("th", { className: "p-2 text-left text-white", children: "Section" }),
          /* @__PURE__ */ jsx("th", { className: "p-2 text-left text-white", children: "Pages" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: getSortedSections().map((section) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: `border-t border-(--outline) transition-colors ${dragOverSection?.id === section.id && draggedSection?.id !== section.id ? "bg-(--red-brown-trans)" : ""} ${editingSection === section.id ? "" : "cursor-move hover:bg-(--accent)"}`,
            draggable: editingSection !== section.id && !draggedPage,
            onDragStart: (e) => handleSectionDragStart(e, section),
            onDragEnd: handleSectionDragEnd,
            onDragOver: handleSectionDragOver,
            onDragEnter: (e) => handleSectionDragEnter(e, section),
            onDrop: (e) => handleSectionDrop(e, section),
            children: [
              /* @__PURE__ */ jsx("td", { className: "p-2 text-center text-(--text-color)", children: /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⋮⋮" }) }),
              /* @__PURE__ */ jsx("td", { className: "p-2 align-top", children: /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: editingSection === section.id ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: sectionName,
                    onChange: (e) => setSectionName(
                      e.target.value
                    ),
                    className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Check,
                  {
                    className: "cursor-pointer ml-auto text-(--text-color)",
                    onClick: () => renameSection(
                      section.id
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  X,
                  {
                    className: "cursor-pointer ml-auto text-(--text-color)",
                    onClick: () => setEditingSection(null)
                  }
                )
              ] }) : /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      toggleSection(
                        section.id
                      );
                    },
                    className: "cursor-pointer text-(--text-color) hover:text-(--outline) shrink-0",
                    title: expandedSections.has(
                      section.id
                    ) ? "Collapse" : "Expand",
                    children: expandedSections.has(
                      section.id
                    ) ? /* @__PURE__ */ jsx(
                      ChevronDown,
                      {
                        size: 16
                      }
                    ) : /* @__PURE__ */ jsx(
                      ChevronRight,
                      {
                        size: 16
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-(--accent-text)", children: section.title }),
                /* @__PURE__ */ jsx(
                  PencilIcon,
                  {
                    className: "cursor-pointer ml-auto text-(--text-color)",
                    onClick: () => {
                      setEditingSection(
                        section.id
                      );
                      setSectionName(
                        section.title
                      );
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  Trash,
                  {
                    className: "cursor-pointer ml-auto text-(--danger-text-color)",
                    onClick: () => {
                      if (confirm(
                        `Delete section "${section.title}"?`
                      )) {
                        deleteSection(
                          section.id
                        );
                      }
                    }
                  }
                )
              ] }) }) }),
              /* @__PURE__ */ jsx("td", { className: "p-2 align-top", children: expandedSections.has(section.id) && /* @__PURE__ */ jsxs(Fragment$1, { children: [
                getSortedPages(section).map(
                  (page) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `mb-1 flex items-center gap-1 rounded px-1 transition-colors ${dragOverPage?.id === page.id && draggedPage?.id !== page.id ? "bg-(--red-brown-trans)" : ""}`,
                      draggable: editingPage !== page.id,
                      onDragStart: (e) => handlePageDragStart(
                        e,
                        page
                      ),
                      onDragEnd: handlePageDragEnd,
                      onDragOver: handlePageDragOver,
                      onDragEnter: (e) => handlePageDragEnter(
                        e,
                        page
                      ),
                      onDrop: (e) => handlePageDrop(
                        e,
                        page,
                        section
                      ),
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "text-(--text-color) cursor-move select-none mr-1 shrink-0", children: "⋮⋮" }),
                        editingPage === page.id ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              value: pageName,
                              onChange: (e) => setPageName(
                                e.target.value
                              ),
                              className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0",
                              onKeyDown: (e) => {
                                if (e.key === "Enter")
                                  renamePage(
                                    page.id
                                  );
                                if (e.key === "Escape")
                                  setEditingPage(
                                    null
                                  );
                              },
                              autoFocus: true
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Check,
                            {
                              size: 14,
                              className: "cursor-pointer shrink-0 text-(--text-color)",
                              onClick: () => renamePage(
                                page.id
                              )
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            X,
                            {
                              size: 14,
                              className: "cursor-pointer shrink-0 text-(--text-color)",
                              onClick: () => setEditingPage(
                                null
                              )
                            }
                          )
                        ] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
                          /* @__PURE__ */ jsx("span", { className: "text-(--accent-text) flex-1 truncate", children: page.title }),
                          /* @__PURE__ */ jsx(
                            PencilIcon,
                            {
                              size: 14,
                              className: "cursor-pointer shrink-0 text-(--text-color)",
                              onClick: () => {
                                setEditingPage(
                                  page.id
                                );
                                setPageName(
                                  page.title
                                );
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Trash,
                            {
                              size: 14,
                              className: "cursor-pointer shrink-0 text-(--danger-text-color)",
                              onClick: () => {
                                if (confirm(
                                  `Delete page "${page.title}"?`
                                ))
                                  deletePage(
                                    page
                                  );
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Info,
                            {
                              size: 14,
                              className: "cursor-pointer shrink-0 text-(--text-color)",
                              onClick: () => setDetailPage(
                                page
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxs(
                            "select",
                            {
                              className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded ml-auto shrink-0",
                              onChange: (e) => changePageSection(
                                page.id,
                                e.target.value,
                                page
                              ),
                              defaultValue: "",
                              children: [
                                /* @__PURE__ */ jsx("option", { value: "", children: "Move to..." }),
                                /* @__PURE__ */ jsx("option", { value: "none", children: "No Section" }),
                                Array.from(
                                  sectionsMap.values()
                                ).filter(
                                  (s) => s.id !== section.id
                                ).map(
                                  (s) => /* @__PURE__ */ jsx(
                                    "option",
                                    {
                                      value: s.id,
                                      children: s.title
                                    },
                                    s.id
                                  )
                                )
                              ]
                            }
                          )
                        ] })
                      ]
                    },
                    page.id
                  )
                ),
                unsectionedPages.length > 0 && /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "relative mt-2",
                    ref: openQuickAdd === section.id ? quickAddRef : null,
                    children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          className: "w-full text-sm font-semibold text-white bg-(--primary) hover:opacity-90 px-3 py-1.5 rounded cursor-pointer transition-colors",
                          onClick: () => setOpenQuickAdd(
                            openQuickAdd === section.id ? null : section.id
                          ),
                          children: "+ Add page"
                        }
                      ),
                      openQuickAdd === section.id && /* @__PURE__ */ jsx("div", { className: "absolute left-0 mb-1 z-10 bg-(--accent) border border-(--outline) rounded shadow-xl min-w-48", children: unsectionedPages.map(
                        (page) => /* @__PURE__ */ jsx(
                          "button",
                          {
                            className: "block w-full text-left px-4 py-2 text-sm text-(--accent-text) hover:bg-(--surface-background) cursor-pointer",
                            onClick: () => {
                              changePageSection(
                                page.id,
                                String(
                                  section.id
                                ),
                                page
                              );
                              setOpenQuickAdd(
                                null
                              );
                            },
                            children: page.title
                          },
                          page.id
                        )
                      ) })
                    ]
                  }
                )
              ] }) })
            ]
          },
          section.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3 sm:hidden", children: getSortedSections().map((section) => /* @__PURE__ */ jsxs(
        "div",
        {
          "data-section-id": section.id,
          className: `border border-(--outline) rounded-lg transition-colors ${dragOverSection?.id === section.id && draggedSection?.id !== section.id ? "bg-(--red-brown-trans)" : ""}`,
          draggable: editingSection !== section.id && !draggedPage,
          onDragStart: (e) => handleSectionDragStart(e, section),
          onDragEnd: handleSectionDragEnd,
          onDragOver: handleSectionDragOver,
          onDragEnter: (e) => handleSectionDragEnter(e, section),
          onDrop: (e) => handleSectionDrop(e, section),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-(--primary) rounded-t-lg", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-white text-lg select-none touch-none",
                  onTouchStart: (e) => handleSectionTouchStart(e, section),
                  onTouchMove: handleSectionTouchMove,
                  onTouchEnd: (e) => handleSectionTouchEnd(e),
                  children: "⋮⋮"
                }
              ),
              editingSection === section.id ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: sectionName,
                    onChange: (e) => setSectionName(e.target.value),
                    className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Check,
                  {
                    size: 18,
                    className: "cursor-pointer shrink-0 text-white",
                    onClick: () => renameSection(section.id)
                  }
                ),
                /* @__PURE__ */ jsx(
                  X,
                  {
                    size: 18,
                    className: "cursor-pointer shrink-0 text-white",
                    onClick: () => setEditingSection(null)
                  }
                )
              ] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold flex-1 truncate text-white", children: section.title }),
                /* @__PURE__ */ jsx(
                  PencilIcon,
                  {
                    size: 16,
                    className: "cursor-pointer shrink-0 text-white",
                    onClick: () => {
                      setEditingSection(section.id);
                      setSectionName(section.title);
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  Trash,
                  {
                    size: 16,
                    className: "cursor-pointer shrink-0 text-white",
                    onClick: () => {
                      if (confirm(
                        `Delete section "${section.title}"?`
                      )) {
                        deleteSection(section.id);
                      }
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      toggleSection(section.id);
                    },
                    className: "cursor-pointer text-white shrink-0 min-w-11 flex items-center justify-center active:opacity-60",
                    title: expandedSections.has(section.id) ? "Collapse" : "Expand",
                    children: expandedSections.has(
                      section.id
                    ) ? /* @__PURE__ */ jsx(ChevronDown, { size: 20 }) : /* @__PURE__ */ jsx(ChevronRight, { size: 20 })
                  }
                )
              ] })
            ] }),
            expandedSections.has(section.id) && /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 flex flex-col gap-1 bg-(--surface-background)", children: [
              getSortedPages(section).map((page) => /* @__PURE__ */ jsxs(
                "div",
                {
                  "data-page-id": page.id,
                  className: `flex items-center gap-2 rounded px-1 py-1 transition-colors ${dragOverPage?.id === page.id && draggedPage?.id !== page.id ? "bg-(--red-brown-trans)" : ""}`,
                  draggable: true,
                  onDragStart: (e) => handlePageDragStart(e, page),
                  onDragEnd: handlePageDragEnd,
                  onDragOver: handlePageDragOver,
                  onDragEnter: (e) => handlePageDragEnter(e, page),
                  onDrop: (e) => handlePageDrop(e, page, section),
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "text-(--text-color) cursor-move select-none shrink-0 touch-none",
                        onTouchStart: (e) => handlePageTouchStart(
                          e,
                          page,
                          section
                        ),
                        onTouchMove: handlePageTouchMove,
                        onTouchEnd: handlePageTouchEnd,
                        children: "⋮⋮"
                      }
                    ),
                    editingPage === page.id ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          value: pageName,
                          onChange: (e) => setPageName(
                            e.target.value
                          ),
                          className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0 text-sm",
                          onKeyDown: (e) => {
                            if (e.key === "Enter")
                              renamePage(
                                page.id
                              );
                            if (e.key === "Escape")
                              setEditingPage(
                                null
                              );
                          },
                          autoFocus: true
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Check,
                        {
                          size: 16,
                          className: "cursor-pointer shrink-0 text-(--text-color)",
                          onClick: () => renamePage(page.id)
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        X,
                        {
                          size: 16,
                          className: "cursor-pointer shrink-0 text-(--text-color)",
                          onClick: () => setEditingPage(null)
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
                      /* @__PURE__ */ jsx("span", { className: "flex-1 truncate text-sm text-(--accent-text)", children: page.title }),
                      /* @__PURE__ */ jsx(
                        PencilIcon,
                        {
                          size: 14,
                          className: "cursor-pointer shrink-0 text-(--text-color)",
                          onClick: () => {
                            setEditingPage(
                              page.id
                            );
                            setPageName(
                              page.title
                            );
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Trash,
                        {
                          size: 14,
                          className: "cursor-pointer shrink-0 text-(--danger-text-color)",
                          onClick: () => {
                            if (confirm(
                              `Delete page "${page.title}"?`
                            ))
                              deletePage(page);
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Info,
                        {
                          size: 14,
                          className: "cursor-pointer shrink-0 text-(--text-color)",
                          onClick: () => openDetailPage(page)
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          className: "bg-(--accent) text-(--accent-text) px-1 py-1 rounded text-xs max-w-[120px] shrink-0",
                          onChange: (e) => changePageSection(
                            page.id,
                            e.target.value,
                            page
                          ),
                          defaultValue: "",
                          children: [
                            /* @__PURE__ */ jsx("option", { value: "", children: "Move to..." }),
                            /* @__PURE__ */ jsx("option", { value: "none", children: "No Section" }),
                            Array.from(
                              sectionsMap.values()
                            ).filter(
                              (s) => s.id !== section.id
                            ).map((s) => /* @__PURE__ */ jsx(
                              "option",
                              {
                                value: s.id,
                                children: s.title
                              },
                              s.id
                            ))
                          ]
                        }
                      )
                    ] })
                  ]
                },
                page.id
              )),
              unsectionedPages.length > 0 && /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative mt-1",
                  ref: openQuickAdd === section.id ? quickAddRef : null,
                  children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        className: "w-full text-sm font-semibold text-white bg-(--primary) hover:opacity-90 px-3 py-1.5 rounded cursor-pointer transition-colors",
                        onClick: () => setOpenQuickAdd(
                          openQuickAdd === section.id ? null : section.id
                        ),
                        children: "+ Add page"
                      }
                    ),
                    openQuickAdd === section.id && /* @__PURE__ */ jsx("div", { className: "absolute left-0 mb-1 z-10 bg-(--accent) border border-(--outline) rounded shadow-xl min-w-48 w-full", children: unsectionedPages.map(
                      (page) => /* @__PURE__ */ jsx(
                        "button",
                        {
                          className: "block w-full text-left px-4 py-2 text-sm text-(--accent-text) hover:bg-(--surface-background) cursor-pointer",
                          onClick: () => {
                            changePageSection(
                              page.id,
                              String(
                                section.id
                              ),
                              page
                            );
                            setOpenQuickAdd(
                              null
                            );
                          },
                          children: page.title
                        },
                        page.id
                      )
                    ) })
                  ]
                }
              )
            ] })
          ]
        },
        section.id
      )) })
    ] }),
    unsectionedPages.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 max-w-4xl w-full", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold mb-2 text-(--accent-text)", children: "Unsectioned Pages" }),
      /* @__PURE__ */ jsxs("table", { className: "w-full border border-(--outline) hidden sm:table", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-(--primary)", children: [
          /* @__PURE__ */ jsx("th", { className: "p-2 text-left text-white", children: "Page" }),
          /* @__PURE__ */ jsx("th", { className: "p-2 text-left text-white", children: "Assign to Section" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: unsectionedPages.map((page) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "border-t border-(--outline) hover:bg-(--accent) transition-colors",
            children: [
              /* @__PURE__ */ jsx("td", { className: "p-2 text-(--accent-text)", children: editingPage === page.id ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: pageName,
                    onChange: (e) => setPageName(
                      e.target.value
                    ),
                    className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0",
                    onKeyDown: (e) => {
                      if (e.key === "Enter")
                        renamePage(page.id);
                      if (e.key === "Escape")
                        setEditingPage(null);
                    },
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsx(
                  Check,
                  {
                    size: 14,
                    className: "cursor-pointer shrink-0 text-(--text-color)",
                    onClick: () => renamePage(page.id)
                  }
                ),
                /* @__PURE__ */ jsx(
                  X,
                  {
                    size: 14,
                    className: "cursor-pointer shrink-0 text-(--text-color)",
                    onClick: () => setEditingPage(null)
                  }
                )
              ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "flex-1", children: page.title }),
                /* @__PURE__ */ jsx(
                  PencilIcon,
                  {
                    size: 14,
                    className: "cursor-pointer shrink-0 text-(--text-color)",
                    onClick: () => {
                      setEditingPage(page.id);
                      setPageName(page.title);
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  Trash,
                  {
                    size: 14,
                    className: "cursor-pointer shrink-0 text-(--danger-text-color)",
                    onClick: () => {
                      if (confirm(
                        `Delete page "${page.title}"?`
                      ))
                        deletePage(page);
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  Info,
                  {
                    size: 14,
                    className: "cursor-pointer shrink-0 text-(--text-color)",
                    onClick: () => openDetailPage(page)
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded",
                  onChange: (e) => changePageSection(
                    page.id,
                    e.target.value,
                    page
                  ),
                  defaultValue: "",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Assign to..." }),
                    Array.from(
                      sectionsMap.values()
                    ).map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.title }, s.id))
                  ]
                }
              ) })
            ]
          },
          page.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:hidden border border-(--outline) rounded-lg bg-(--surface-background)", children: unsectionedPages.map((page) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex items-center gap-2 border-t border-(--outline) first:border-t-0 px-3 py-2 hover:bg-(--accent) transition-colors",
          children: editingPage === page.id ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                value: pageName,
                onChange: (e) => setPageName(e.target.value),
                className: "bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0 text-sm",
                onKeyDown: (e) => {
                  if (e.key === "Enter")
                    renamePage(page.id);
                  if (e.key === "Escape")
                    setEditingPage(null);
                },
                autoFocus: true
              }
            ),
            /* @__PURE__ */ jsx(
              Check,
              {
                size: 16,
                className: "cursor-pointer shrink-0 text-(--text-color)",
                onClick: () => renamePage(page.id)
              }
            ),
            /* @__PURE__ */ jsx(
              X,
              {
                size: 16,
                className: "cursor-pointer shrink-0 text-(--text-color)",
                onClick: () => setEditingPage(null)
              }
            )
          ] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
            /* @__PURE__ */ jsx("span", { className: "flex-1 truncate text-sm text-(--accent-text)", children: page.title }),
            /* @__PURE__ */ jsx(
              PencilIcon,
              {
                size: 14,
                className: "cursor-pointer shrink-0 text-(--text-color)",
                onClick: () => {
                  setEditingPage(page.id);
                  setPageName(page.title);
                }
              }
            ),
            /* @__PURE__ */ jsx(
              Trash,
              {
                size: 14,
                className: "cursor-pointer shrink-0 text-(--danger-text-color)",
                onClick: () => {
                  if (confirm(
                    `Delete page "${page.title}"?`
                  ))
                    deletePage(page);
                }
              }
            ),
            /* @__PURE__ */ jsx(
              Info,
              {
                size: 14,
                className: "cursor-pointer shrink-0 text-(--text-color)",
                onClick: () => openDetailPage(page)
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "bg-(--accent) text-(--accent-text) px-1 py-1 rounded text-xs max-w-[140px] shrink-0",
                onChange: (e) => changePageSection(
                  page.id,
                  e.target.value,
                  page
                ),
                defaultValue: "",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Assign to..." }),
                  Array.from(
                    sectionsMap.values()
                  ).map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.title }, s.id))
                ]
              }
            )
          ] })
        },
        page.id
      )) })
    ] }),
    themeOpen && editingTheme && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
        onClick: cancelTheme,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-(--surface-background) border border-(--outline) rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-(--accent-text)", children: "Game Theme" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: cancelTheme,
                    className: "shrink-0 text-(--text-color) hover:text-(--accent-text) cursor-pointer",
                    children: /* @__PURE__ */ jsx(X, { size: 20 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: THEME_FIELDS.map(({ key, label, description }) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-3",
                  children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "color",
                        value: editingTheme[key],
                        onChange: (e) => handleThemeChange(key, e.target.value),
                        className: "w-10 h-10 rounded cursor-pointer border border-(--outline) shrink-0 p-0.5 bg-transparent"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-0", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-(--accent-text)", children: label }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs text-(--text-color)", children: description })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "ml-auto font-mono text-xs text-(--text-color) shrink-0", children: editingTheme[key] })
                  ]
                },
                key
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2 border-t border-(--outline)", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: resetThemeToDefaults,
                    className: "text-sm text-(--text-color) border border-(--outline) px-3 py-1.5 rounded cursor-pointer hover:bg-(--accent)",
                    children: "Reset to defaults"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: cancelTheme,
                    className: "ml-auto text-sm text-(--text-color) border border-(--outline) px-3 py-1.5 rounded cursor-pointer hover:bg-(--accent)",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: saveTheme,
                    className: "text-sm bg-(--primary) text-white px-4 py-1.5 rounded cursor-pointer hover:opacity-90 font-semibold",
                    children: "Save"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    detailPage && (() => {
      const previewUrl = detailSlug ? "/" + detailSlug : null;
      const section = detailPage.sectionId ? sectionsMap.get(detailPage.sectionId) : null;
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
          onClick: () => setDetailPage(null),
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "bg-(--surface-background) border border-(--outline) rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-(--accent-text) leading-tight", children: "Page Details" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setDetailPage(null),
                      className: "shrink-0 text-(--text-color) hover:text-(--accent-text) cursor-pointer",
                      children: /* @__PURE__ */ jsx(X, { size: 20 })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 text-sm", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-(--text-color) font-semibold block mb-1", children: "Title" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: detailTitle,
                        onChange: (e) => setDetailTitle(e.target.value),
                        className: "bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded w-full"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-(--text-color) font-semibold block mb-1", children: "URL slug" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: detailSlug,
                        onChange: (e) => setDetailSlug(e.target.value),
                        className: "bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded w-full font-mono",
                        placeholder: "page-slug"
                      }
                    ),
                    previewUrl && /* @__PURE__ */ jsx("p", { className: "text-(--text-color) text-xs mt-1 break-all font-mono", children: previewUrl })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-(--text-color) font-semibold mb-0.5", children: "Section" }),
                    /* @__PURE__ */ jsx("p", { className: "text-(--accent-text)", children: section ? section.title : /* @__PURE__ */ jsx("span", { className: "italic text-(--text-color)", children: "None" }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-(--text-color) font-semibold mb-0.5", children: "Page ID" }),
                    /* @__PURE__ */ jsx("p", { className: "text-(--accent-text) font-mono", children: detailPage.id })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border-t border-(--outline) pt-4 flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-(--accent-text) font-semibold text-sm", children: "Discord Embed" }),
                  /* @__PURE__ */ jsx("p", { className: "text-(--text-color) text-xs italic", children: "Customization coming soon." })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: savePageDetail,
                    className: "bg-(--primary) text-white px-4 py-2 rounded cursor-pointer hover:opacity-90 font-semibold",
                    children: "Save"
                  }
                )
              ]
            }
          )
        }
      );
    })()
  ] });
}
const handle$2 = {
  title: "Navbar Manager"
};
const navigationPanel = UNSAFE_withComponentProps(function NavigationPanelRoute() {
  return /* @__PURE__ */ jsx(ProtectedRoute, {
    requiredRole: "ADMIN",
    children: /* @__PURE__ */ jsx(NavigationPanel, {
      isAdmin: true
    })
  });
});
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: navigationPanel,
  handle: handle$2
}, Symbol.toStringTag, { value: "Module" }));
function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);
  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate("/");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full mx-auto mt-8 px-4 flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-(--surface-background) border-2 border-(--primary) rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-3 bg-red-900/30 border border-red-700 rounded text-(--text-color) text-sm", children: "Login Failed" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "username",
              className: "text-(--text-color) font-semibold text-sm",
              children: "Username"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "username",
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              disabled: isLoading,
              required: true,
              className: "px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "password",
              className: "text-(--text-color) font-semibold text-sm",
              children: "Password"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              disabled: isLoading,
              required: true,
              className: "px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading,
            className: "mt-6 px-4 py-2 bg-(--primary) text-amber-50 rounded font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            children: isLoading ? "Logging in..." : "Login"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 pt-6 border-t border-(--primary) text-center text-(--text-color) text-sm", children: /* @__PURE__ */ jsxs("p", { children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/signup",
            className: "text-(--primary) font-semibold hover:underline cursor-pointer",
            children: "Sign Up"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Link, { className: "text-center mt-2 self-center", to: "/", children: "Back to GuideCodex" })
  ] });
}
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LoginPage
}, Symbol.toStringTag, { value: "Module" }));
function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [localError, setLocalError] = useState(null);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);
  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    if (password !== passwordConfirm) {
      setLocalError("Passwords do not match");
      return;
    }
    const success = await signup(username, password, adminSecret);
    if (success) {
      navigate("/");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md mx-auto mt-8 px-4 flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-(--surface-background) border-2 border-(--primary) rounded p-6", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
        (error || localError) && /* @__PURE__ */ jsx("div", { className: "p-3 bg-red-900/30 border border-red-700 rounded text-(--text-color) text-sm", children: error || localError }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "username",
              className: "text-(--text-color) font-semibold text-sm",
              children: "Username"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "username",
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              disabled: isLoading,
              required: true,
              className: "px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "password",
              className: "text-(--text-color) font-semibold text-sm",
              children: "Password"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              disabled: isLoading,
              required: true,
              className: "px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "passwordConfirm",
              className: "text-(--text-color) font-semibold text-sm",
              children: "Confirm Password"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "passwordConfirm",
              type: "password",
              value: passwordConfirm,
              onChange: (e) => setPasswordConfirm(e.target.value),
              disabled: isLoading,
              required: true,
              className: "px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-(--primary)", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAdminSecret(!showAdminSecret),
              className: "text-(--primary) font-semibold hover:underline cursor-pointer text-sm",
              children: showAdminSecret ? "Hide" : "Register as Admin"
            }
          ),
          showAdminSecret && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 mt-3", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "adminSecret",
                className: "text-(--text-color) font-semibold text-sm",
                children: "Admin Secret"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "adminSecret",
                type: "password",
                value: adminSecret,
                onChange: (e) => setAdminSecret(e.target.value),
                disabled: isLoading,
                className: "px-3 py-2 border-b border-white bg-(--surface-background) text-(--text-color) focus:outline-none disabled:opacity-50"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading,
            className: "mt-6 px-4 py-2 bg-(--primary) text-amber-50 rounded font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            children: isLoading ? "Signing up..." : "Sign Up"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-6 border-t border-(--primary) text-center text-(--text-color) text-sm", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/login",
            className: "text-(--primary) font-semibold hover:underline cursor-pointer",
            children: "Login"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(Link, { className: "text-center mt-2 self-center", to: "/", children: "Back to GuideCodex" })
  ] });
}
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SignupPage
}, Symbol.toStringTag, { value: "Module" }));
function ReviewPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewMessage, setReviewMessage] = useState({});
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const response = await fetch(`${currentAPI}/reviews`, {
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);
  async function handleAccept(reviewId) {
    try {
      setActionLoading(reviewId);
      const response = await fetch(
        `${currentAPI}/reviews/${reviewId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({})
        }
      );
      if (!response.ok) {
        throw new Error("Failed to accept review");
      }
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }
  async function handleRefuse(reviewId) {
    const message = reviewMessage[reviewId];
    if (!message) {
      setError("Please provide a review message");
      return;
    }
    setError("");
    try {
      setActionLoading(reviewId);
      const response = await fetch(
        `${currentAPI}/reviews/${reviewId}/refuse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ message })
        }
      );
      if (!response.ok) {
        throw new Error("Failed to refuse review");
      }
      setReviews(reviews.filter((r) => r.id !== reviewId));
      setReviewMessage({ ...reviewMessage, [reviewId]: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "text-(--text-color)", children: "Loading reviews..." });
  }
  if (reviews.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-(--text-color)", children: "No pending reviews" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
    error && /* @__PURE__ */ jsx("div", { className: "p-3 bg-(--primary)/20 border border-(--primary) rounded text-(--text-color)", children: error }),
    reviews.map((review) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "p-4 border border-(--primary) rounded bg-(--surface-background)",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-(--text-color) font-semibold", children: [
              "User: ",
              review.user?.username || "Unknown"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-(--text-color) text-sm", children: [
              "Operation: ",
              review.operation
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-(--text-color) text-sm", children: [
              "Status: ",
              review.status
            ] })
          ] }),
          review.content && /* @__PURE__ */ jsxs("div", { className: "mb-3 p-2 bg-(--primary)/10 rounded", children: [
            /* @__PURE__ */ jsx("p", { className: "text-(--text-color) text-sm font-semibold mb-1", children: "Proposed Changes:" }),
            /* @__PURE__ */ jsx("div", { className: "text-(--text-color) text-sm", children: review.operation === "CREATE" ? /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Type:" }),
                " ",
                review.content.type
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Order:" }),
                " ",
                review.content.order
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Page ID:" }),
                " ",
                review.content.pageId
              ] }),
              review.content.content && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Content:" }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    dangerouslySetInnerHTML: {
                      __html: review.content.content
                    }
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsx(
              "div",
              {
                dangerouslySetInnerHTML: {
                  __html: review.content.content || JSON.stringify(review.content)
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-3", children: /* @__PURE__ */ jsx(
            "textarea",
            {
              value: reviewMessage[review.id] || "",
              onChange: (e) => setReviewMessage({
                ...reviewMessage,
                [review.id]: e.target.value
              }),
              placeholder: "Review message (required to refuse)",
              className: "px-3 py-2 border border-(--primary) rounded bg-(--surface-background) text-(--text-color) focus:outline-none resize-none",
              rows: "3"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleAccept(review.id),
                disabled: actionLoading === review.id,
                className: "px-4 py-2 bg-(--primary) text-amber-50 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90 text-sm",
                children: actionLoading === review.id ? "Processing..." : "Accept"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRefuse(review.id),
                disabled: actionLoading === review.id,
                className: "px-4 py-2 bg-(--outline) text-amber-50 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90 text-sm",
                children: actionLoading === review.id ? "Processing..." : "Refuse"
              }
            )
          ] })
        ]
      },
      review.id
    ))
  ] });
}
function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch(`${currentAPI}/users`, {
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.filter((u) => u?.username !== user?.username));
        setError(null);
      } catch (err) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [user]);
  async function handleRoleChange(userId, newRole) {
    try {
      setActionLoading(userId);
      const response = await fetch(`${currentAPI}/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ newRole })
      });
      if (!response.ok) {
        throw new Error("Failed to update user role");
      }
      const data = await response.json();
      const updatedUser = data.user || data;
      setUsers(users.map((u) => u.id === userId ? updatedUser : u));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "text-(--text-color)", children: "Loading users..." });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-3 bg-(--primary)/20 border border-(--primary) rounded text-(--text-color)", children: error });
  }
  if (users.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-(--text-color)", children: "No users found" });
  }
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-(--primary)", children: [
      /* @__PURE__ */ jsx("th", { className: "text-left p-3 text-(--text-color) font-semibold", children: "Username" }),
      /* @__PURE__ */ jsx("th", { className: "text-left p-3 text-(--text-color) font-semibold", children: "Current Role" }),
      /* @__PURE__ */ jsx("th", { className: "text-left p-3 text-(--text-color) font-semibold", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: users.map((u) => /* @__PURE__ */ jsxs(
      "tr",
      {
        className: "border-b border-(--primary)/30 hover:bg-(--primary)/10 transition-colors",
        children: [
          /* @__PURE__ */ jsx("td", { className: "p-3 text-(--text-color)", children: u.username }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-(--text-color)", children: u.role }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            u.role !== "ADMIN" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRoleChange(u.id, "ADMIN"),
                disabled: actionLoading === u.id,
                className: "px-3 py-1 bg-(--primary) text-amber-50 rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90",
                children: "Make Admin"
              }
            ),
            u.role !== "EDITOR" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRoleChange(u.id, "EDITOR"),
                disabled: actionLoading === u.id,
                className: "px-3 py-1 bg-(--primary) text-amber-50 rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90",
                children: "Make Editor"
              }
            ),
            u.role !== "USER" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRoleChange(u.id, "USER"),
                disabled: actionLoading === u.id,
                className: "px-3 py-1 bg-(--primary) text-amber-50 rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90",
                children: "Make User"
              }
            )
          ] }) })
        ]
      },
      u.id
    )) })
  ] }) });
}
function DashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("reviews");
  useEffect(() => {
    document.title = "Dashboard";
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-6xl mx-auto mt-8 px-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-6 border-b border-(--primary)", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("reviews"),
          className: `px-4 py-3 font-semibold cursor-pointer transition-colors ${activeTab === "reviews" ? "border-b-2 border-(--primary) text-(--primary) bg-(--surface-background)/30" : "text-(--text-color) hover:text-(--primary)"}`,
          children: "Pending Reviews"
        }
      ),
      user?.role === "ADMIN" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("users"),
          className: `px-4 py-3 font-semibold cursor-pointer transition-colors ${activeTab === "users" ? "border-b-2 border-(--primary) text-(--primary) bg-(--surface-background)/30" : "text-(--text-color) hover:text-(--primary)"}`,
          children: "User Management"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "py-6", children: [
      activeTab === "reviews" && /* @__PURE__ */ jsx(ReviewPanel, {}),
      activeTab === "users" && user?.role === "ADMIN" && /* @__PURE__ */ jsx(UserManagement, {})
    ] })
  ] });
}
const handle$1 = {
  title: "Dashboard"
};
const dashboard = UNSAFE_withComponentProps(function Dashboard() {
  return /* @__PURE__ */ jsx(ProtectedRoute, {
    requiredRole: "EDITOR",
    children: /* @__PURE__ */ jsx(DashboardContent, {})
  });
});
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: dashboard,
  handle: handle$1
}, Symbol.toStringTag, { value: "Module" }));
function AccessDeniedPage() {
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md mx-auto mt-20 px-4 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-(--text-color) mb-4", children: "Access Denied" }),
    /* @__PURE__ */ jsx("p", { className: "text-(--text-color) mb-6", children: "You don't have permission to access this page." }),
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-block px-4 py-2 bg-(--primary) text-amber-50 rounded font-semibold cursor-pointer hover:opacity-90",
        children: "Back to Home"
      }
    )
  ] });
}
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AccessDeniedPage
}, Symbol.toStringTag, { value: "Module" }));
function NotFound() {
  return /* @__PURE__ */ jsxs("div", { className: "content-block", children: [
    /* @__PURE__ */ jsx("h1", { children: "404" }),
    /* @__PURE__ */ jsx("p", { children: "This page doesn't exist" })
  ] });
}
const handle = {
  title: "404"
};
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NotFound,
  handle
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Cm36hgD3.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/root-COvJtcZf.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/AuthContext-XAl0zdOo.js", "/assets/api-DZGr2Fk-.js", "/assets/ThemeProvider-D1Y9k7Vr.js"], "css": ["/assets/root-DAtQiJab.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/old-pages": { "id": "routes/old-pages", "parentId": "root", "path": "/pages/:page", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/old-pages-BHBLkflV.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "main": { "id": "main", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/layout-B06vNidR.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js", "/assets/AuthContext-XAl0zdOo.js", "/assets/ThemeProvider-D1Y9k7Vr.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/pencil-DSk1CVHI.js", "/assets/x-DLti0-co.js", "/assets/useAuth-ds-rD23W.js"], "css": ["/assets/layout-CQMAlS4_.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "main", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-BslqgMcx.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/x-DLti0-co.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/page-slug": { "id": "routes/page-slug", "parentId": "main", "path": ":pageSlug", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-slug-Ddi7v5LM.js", "imports": ["/assets/home-BslqgMcx.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/x-DLti0-co.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/game-layout": { "id": "routes/game-layout", "parentId": "main", "path": "games/:gameSlug", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/game-layout-B0IauSlY.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/game-home": { "id": "routes/game-home", "parentId": "routes/game-layout", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/game-home-Ddi7v5LM.js", "imports": ["/assets/home-BslqgMcx.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/x-DLti0-co.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "game-page-slug": { "id": "game-page-slug", "parentId": "routes/game-layout", "path": ":pageSlug", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/game-page-Ddi7v5LM.js", "imports": ["/assets/home-BslqgMcx.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/x-DLti0-co.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "game-guardian-costs": { "id": "game-guardian-costs", "parentId": "routes/game-layout", "path": "guardian-upgrade-costs", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/guardian-costs-BwRGQ4KO.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "game-immortal-guardians": { "id": "game-immortal-guardians", "parentId": "routes/game-layout", "path": "immortal-guardians", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/immortal-guardians-BfEwLYit.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": ["/assets/immortal-guardians-BhGpVoxj.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/flea-guide": { "id": "routes/flea-guide", "parentId": "routes/game-layout", "path": "flea-guide", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/flea-guide-C8uh8FaN.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "game-page-manager": { "id": "game-page-manager", "parentId": "routes/game-layout", "path": "page-manager", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-manager-CfWWnqz0.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/ProtectedRoute-BMi3ZDWJ.js", "/assets/api-DZGr2Fk-.js", "/assets/index-CBUVxBP-.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "game-game-manager": { "id": "game-game-manager", "parentId": "routes/game-layout", "path": "game-manager", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/game-manager-B7H4g8gx.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/ProtectedRoute-BMi3ZDWJ.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "game-navigation-panel": { "id": "game-navigation-panel", "parentId": "routes/game-layout", "path": "navigation-panel", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/navigation-panel-BZdLUk_6.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/ProtectedRoute-BMi3ZDWJ.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/ThemeProvider-D1Y9k7Vr.js", "/assets/x-DLti0-co.js", "/assets/pencil-DSk1CVHI.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "top-guardian-costs": { "id": "top-guardian-costs", "parentId": "main", "path": "guardian-upgrade-costs", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/guardian-costs-BwRGQ4KO.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "top-immortal-guardians": { "id": "top-immortal-guardians", "parentId": "main", "path": "immortal-guardians", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/immortal-guardians-BfEwLYit.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": ["/assets/immortal-guardians-BhGpVoxj.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "main", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/login-DoIniX_D.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/useAuth-ds-rD23W.js", "/assets/index-CBUVxBP-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/signup": { "id": "routes/signup", "parentId": "main", "path": "signup", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/signup-St-hpmQ3.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/useAuth-ds-rD23W.js", "/assets/index-CBUVxBP-.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/dashboard": { "id": "routes/dashboard", "parentId": "main", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/dashboard-Khr3u3ev.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/ProtectedRoute-BMi3ZDWJ.js", "/assets/index-CBUVxBP-.js", "/assets/useAuth-ds-rD23W.js", "/assets/api-DZGr2Fk-.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/access-denied": { "id": "routes/access-denied", "parentId": "main", "path": "access-denied", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/access-denied-BzO9u25s.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "top-page-manager": { "id": "top-page-manager", "parentId": "main", "path": "page-manager", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-manager-CfWWnqz0.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/ProtectedRoute-BMi3ZDWJ.js", "/assets/api-DZGr2Fk-.js", "/assets/index-CBUVxBP-.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "top-game-manager": { "id": "top-game-manager", "parentId": "main", "path": "game-manager", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/game-manager-B7H4g8gx.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/ProtectedRoute-BMi3ZDWJ.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "top-navigation-panel": { "id": "top-navigation-panel", "parentId": "main", "path": "navigation-panel", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/navigation-panel-BZdLUk_6.js", "imports": ["/assets/chunk-LFPYN7LY-CcihArmh.js", "/assets/jsx-runtime-D_zvdyIk.js", "/assets/ProtectedRoute-BMi3ZDWJ.js", "/assets/index-CBUVxBP-.js", "/assets/api-DZGr2Fk-.js", "/assets/ThemeProvider-D1Y9k7Vr.js", "/assets/x-DLti0-co.js", "/assets/pencil-DSk1CVHI.js", "/assets/useAuth-ds-rD23W.js", "/assets/AuthContext-XAl0zdOo.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "not-found-404": { "id": "not-found-404", "parentId": "main", "path": "404", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/not-found-CyNaDhbV.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "not-found-wildcard": { "id": "not-found-wildcard", "parentId": "main", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/not-found-CyNaDhbV.js", "imports": ["/assets/jsx-runtime-D_zvdyIk.js", "/assets/index-CBUVxBP-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-ba3598ee.js", "version": "ba3598ee", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = ["/", "/guardian-upgrade-costs", "/immortal-guardians", "/unlock-order", "/treasure-upgrade-costs", "/hard-gameplay", "/unlock-order-hard", "/guild-battle", "/lucky-defense", "/guardian-upgrade-costs", "/lance-kitty", "/hell-mode", "/testttt", "/hell-mode-basics", "/hell-mode-bosses", "/magic-hell-build", "/sb-mg", "/mythic-categories", "/stun-guide", "/defense-reduction", "/reaper-dian", "/new-page", "/immortal-guardians", "/immortal-main", "/mp-regen", "/attack-speed", "/hi", "/newbie-quests", "/safe-box-table", "/pets", "/indy-treasures", "/daily-fortunes", "/unlock-treasures", "/exclusive-treasures"];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/old-pages": {
    id: "routes/old-pages",
    parentId: "root",
    path: "/pages/:page",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "main": {
    id: "main",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/home": {
    id: "routes/home",
    parentId: "main",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  },
  "routes/page-slug": {
    id: "routes/page-slug",
    parentId: "main",
    path: ":pageSlug",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/game-layout": {
    id: "routes/game-layout",
    parentId: "main",
    path: "games/:gameSlug",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/game-home": {
    id: "routes/game-home",
    parentId: "routes/game-layout",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "game-page-slug": {
    id: "game-page-slug",
    parentId: "routes/game-layout",
    path: ":pageSlug",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "game-guardian-costs": {
    id: "game-guardian-costs",
    parentId: "routes/game-layout",
    path: "guardian-upgrade-costs",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "game-immortal-guardians": {
    id: "game-immortal-guardians",
    parentId: "routes/game-layout",
    path: "immortal-guardians",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/flea-guide": {
    id: "routes/flea-guide",
    parentId: "routes/game-layout",
    path: "flea-guide",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "game-page-manager": {
    id: "game-page-manager",
    parentId: "routes/game-layout",
    path: "page-manager",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "game-game-manager": {
    id: "game-game-manager",
    parentId: "routes/game-layout",
    path: "game-manager",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "game-navigation-panel": {
    id: "game-navigation-panel",
    parentId: "routes/game-layout",
    path: "navigation-panel",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "top-guardian-costs": {
    id: "top-guardian-costs",
    parentId: "main",
    path: "guardian-upgrade-costs",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "top-immortal-guardians": {
    id: "top-immortal-guardians",
    parentId: "main",
    path: "immortal-guardians",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/login": {
    id: "routes/login",
    parentId: "main",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "main",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "routes/dashboard": {
    id: "routes/dashboard",
    parentId: "main",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "routes/access-denied": {
    id: "routes/access-denied",
    parentId: "main",
    path: "access-denied",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "top-page-manager": {
    id: "top-page-manager",
    parentId: "main",
    path: "page-manager",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "top-game-manager": {
    id: "top-game-manager",
    parentId: "main",
    path: "game-manager",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "top-navigation-panel": {
    id: "top-navigation-panel",
    parentId: "main",
    path: "navigation-panel",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "not-found-404": {
    id: "not-found-404",
    parentId: "main",
    path: "404",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "not-found-wildcard": {
    id: "not-found-wildcard",
    parentId: "main",
    path: "*",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
