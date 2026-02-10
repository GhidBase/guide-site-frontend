//import pencilIcon from "../assets/pencil-svgrepo-com.svg";
import { PencilIcon, Check, Save, X, Undo2 } from "lucide-react";

export default function NavbarSection({
    navbarTitle,
    className,
    navbarEditMode,
    id,
}) {
    if (navbarEditMode) {
        return (
            <div className={className} id={"nav-section-editview-" + id}>
                <h1>{navbarTitle}</h1>
                <PencilIcon className="ml-2"></PencilIcon>
            </div>
        );
    } else {
        return <h1 className={className}>{navbarTitle}</h1>;
    }
}
