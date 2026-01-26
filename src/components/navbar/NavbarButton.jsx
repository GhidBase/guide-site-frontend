import { Link } from "react-router";
import { usePage } from "../../contexts/PageProvider";

export default function NavbarButton({
    slug,
    navbarTitle,
    className,
    toggleNav,
    gameSlug,
}) {
    return (
        <Link
            className={className}
            to={"/" + gameSlug + slug}
            onClick={() => toggleNav(false)}
        >
            {navbarTitle}
        </Link>
    );
}
