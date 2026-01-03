import { Link } from "react-router";

export default function NavbarButton({ slug, navbarTitle, className }) {
    return (
        <Link className={className} to={slug}>
            {navbarTitle}
        </Link>
    );
}
