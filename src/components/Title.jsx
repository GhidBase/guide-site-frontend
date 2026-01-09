import { usePage } from "../contexts/PageProvider";
import ldgLogo from "../assets/LDG_Title.webp";

export default function Title() {
    const { title, setTitle } = usePage();

    // if (title == "LD Homepage") {
    //     return <img className="h-30" src={ldgLogo} alt="" />;
    // }
    return (
        <div
            id="page-builder-title"
            className="title flex items-center justify-center text-4xl sm:text-7xl"
        >
            {title == "LD Homepage" ? <img src={ldgLogo} className=" object-cover md:h-30 lg:h-35" alt="" /> :title}
        </div>
    );
}
