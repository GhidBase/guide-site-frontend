import { Link } from "react-router";

export default function NavbarButton({
    slug,
    navbarTitle,
    className,
    toggleNav,
}) {
    return (
        <Link className={className} to={slug} onClick={() => toggleNav(false)}>
            {navbarTitle}
        </Link>
    );
}
