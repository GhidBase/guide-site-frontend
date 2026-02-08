import { Link, Outlet } from "react-router";
import { Fragment } from "react";

export default function PlaceholderMenu() {
    return (
        <Fragment>
            <ul className="flex flex-col gap-2 place-content-center h-20">
                <Link to="/">Main</Link>
                <Link to="/flea-guide">Flea Guide</Link>
            </ul>
            <Outlet></Outlet>
        </Fragment>
    );
}
