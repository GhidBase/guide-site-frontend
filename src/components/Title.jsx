import { usePage } from "../contexts/PageProvider";

export default function Title() {
    const { title, setTitle } = usePage();

    return (
        <div
            id="page-builder-title"
            className="title flex items-center justify-center text-4xl sm:text-7xl"
        >
            {title}
        </div>
    );
}
