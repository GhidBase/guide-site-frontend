import { Link } from "react-router";
export function Homepage() {
    return (
        <>
            <h1>Welcome to GuideHub!</h1>
            <Link to="/lucky-defense">Lucky Defense</Link>
        </>
    );
}
