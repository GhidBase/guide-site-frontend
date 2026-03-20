import { Link } from "react-router";
import { useLoaderData } from "react-router";
import { PencilIcon, Check, X } from "lucide-react";
import { useState } from "react";

export default function NavbarButton({
    slug,
    navbarTitle,
    className,
    toggleNav,
    navbarEditMode,
    nonEditable,
    buttonData,
}) {
    const { gameData, isLDG } = useLoaderData();
    var actualSlug;
    if (isLDG) {
        actualSlug = "/" + slug;
    } else if (slug === gameData?.slug) {
        actualSlug = "/games/" + gameData.slug;
    } else {
        actualSlug = "/games/" + gameData.slug + "/" + slug;
    }
    const [editMode, setEditMode] = useState(false);
    const [inputText, setInputText] = useState(navbarTitle);

    function toggleEditMode() {
        setEditMode(!editMode);
        setInputText(navbarTitle);
    }

    if (navbarEditMode && !nonEditable) {
        return (
            <div className={className}>
                {!editMode ? (
                    <div className="flex w-full px-2 mb-0.5 ">
                        <p className="flex-1">{navbarTitle}</p>
                        <PencilIcon
                            className=" cursor-pointer"
                            onClick={() => toggleEditMode()}
                        />
                    </div>
                ) : (
                    <div className="flex w-full h-full items-center ">
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="min-w-0 flex-1 h-full py-1 px-2 "
                        />
                        {inputText != navbarTitle && (
                            <Check
                                onClick={() => toggleEditMode()}
                                className="h-10 w-10 cursor-pointer "
                            />
                        )}{" "}
                        <X
                            onClick={() => toggleEditMode()}
                            className="h-10 w-10 cursor-pointer "
                        />
                    </div>
                )}
            </div>
        );
    }

    //console.log(actualSlug);
    return (
        <Link
            className={className + " transition-transform hover:translate-x-2"}
            to={actualSlug}
            onClick={() => toggleNav(false)}
            viewTransition
        >
            {navbarTitle}
        </Link>
    );
}
