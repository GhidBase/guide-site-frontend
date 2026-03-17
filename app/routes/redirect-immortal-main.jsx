import { redirect } from "react-router";

export function loader() {
    return redirect("/immortal-guardians", 301);
}

export default function RedirectImmortalMain() {
    return null;
}
