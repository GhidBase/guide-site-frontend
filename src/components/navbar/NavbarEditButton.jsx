import { PencilIcon, Check } from "lucide-react";

export default function NavbarEditButton({
    toggleEditMode,
    className,
    navbarEditMode,
}) {
    if (!navbarEditMode) {
        return (
            <button className={className} onClick={toggleEditMode}>
                Edit Nav
            </button>
        );
    }
    return (
        <button className={className} onClick={toggleEditMode}>
            Finish Nav Edit
            <Check className="ml-2" />
        </button>
    );
}
