import { useState } from "react";

function ChecklistItem({
    title,
    inGameUrl,
    mapUrl,
    id,
    checkedItems,
    toggleItem,
    hide,
    description,
}) {
    const [picsVisible, setPicsVisible] = useState(false);
    const [descriptionVisible, setDescriptionVisible] = useState(false);

    return (
        <li
            className={`transition-all duration-400 ${
                (hide && "scale-y-0") || "scale-y-100"
            }`}
        >
            {/* Main container */}
            <div
                style={{
                    backgroundImage: `url(${inGameUrl})`,
                }}
                className={`bg-no-repeat text-white bg-neutral-900 shadow-black transition-all duration-400 ${
                    hide && "delay-100"
                } box-border w-full rounded-md px-2 min-h-0 overflow-hidden flex flex-col gap-2 ${
                    (hide && "h-0 py-0 shadow-none") ||
                    (!picsVisible &&
                        "h-11 py-2 mb-4 shadow-md bg-cover bg-center") ||
                    "h-115 py-2 mb-4 shadow-md bg-position-[center_100%]"
                } relative`}
            >
                {/* Header - Checkbox, Title, and Button */}
                <div className="flex">
                    <label className="flex">
                        <input
                            className="accent-neutral-200 bg-neutral-200"
                            id={"checkbox-" + title}
                            name={"checkbox" + title}
                            type="checkbox"
                            checked={checkedItems.includes(id)}
                            onChange={() => toggleItem(id)}
                        />
                        <p
                            className={`flex px-2.5 rounded-lg flex-1 transition-all items-center ml-2 ${
                                picsVisible ? "bg-black/70" : "bg-black/20"
                            }`}
                        >
                            {title}
                        </p>
                    </label>
                    <button
                        onClick={() => setPicsVisible(!picsVisible)}
                        className="text-amber-50 bg-neutral-600 rounded px-2 py-0.5 ml-auto w-16"
                    >
                        {(picsVisible && "Hide") || "Show"}
                    </button>
                </div>
                {/* Images */}
                <img
                    className={`object-cover h-45 w-80 justify-center transition-all duration-400 mx-auto ${
                        (picsVisible && "opacity-100") || "opacity-0"
                    } ${descriptionVisible ? "translate-x-[-150%]" : ""}`}
                    src={inGameUrl}
                    alt=""
                />
                <img
                    className={`object-cover h-45 w-80 justify-center transition-all duration-400 mx-auto ${
                        (picsVisible && "opacity-100") || "opacity-0"
                    } ${descriptionVisible ? "translate-x-[-150%]" : ""}`}
                    src={mapUrl}
                    alt=""
                />
                <p
                    className={`absolute transition-all rounded-lg duration-400 top-12 box-border p-4 h-91 w-80 left-1/2 bg-black/70
                        ${picsVisible ? "opacity-100" : "opacity-0"}
                        ${
                            descriptionVisible
                                ? "translate-x-[-50%]"
                                : "translate-x-100"
                        }`}
                >
                    {description}
                </p>
                <button
                    onClick={() => setDescriptionVisible(!descriptionVisible)}
                    className={`text-amber-50 bg-neutral-600 rounded px-2 py-0.5 transition-all mx-auto w-40`}
                >
                    {(descriptionVisible && "Show Images") ||
                        "Show Description"}
                </button>
            </div>
        </li>
    );
}

export default ChecklistItem;
