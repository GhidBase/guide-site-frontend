import { Fragment } from "react";
import "../tailwind.css";
import { useState } from "react";

function ChecklistItem({
    title,
    inGameUrl,
    mapUrl,
    id,
    checkedItems,
    toggleItem,
    hide,
}) {
    const [picsVisible, setPicsVisible] = useState(false);

    return (
        <li
            className={`transition-all duration-400 ${
                (hide && "scale-y-0") || "scale-y-100"
            }`}
        >
            <div
                style={{
                    backgroundImage: !picsVisible
                        ? `url(${inGameUrl})`
                        : undefined,
                }}
                className={`bg-cover bg-center text-white bg-neutral-900 shadow-black transition-all duration-400 ${
                    hide && "delay-100"
                } box-border w-full rounded-md px-2 min-h-0 overflow-hidden flex flex-col gap-2 ${
                    (hide && "h-0 py-0 shadow-none") ||
                    (!picsVisible && "h-11 py-2 mb-4 shadow-md") ||
                    "h-110 py-2 mb-4 shadow-md"
                }`}
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
                        <p className="flex flex-1 items-center ml-2">{title}</p>
                    </label>
                    <button
                        onClick={() => setPicsVisible(!picsVisible)}
                        className="text-amber-50 bg-neutral-600 rounded px-2 py-0.5 ml-auto"
                    >
                        {(picsVisible && "Hide") || "Show"}
                    </button>
                </div>
                {/* Images */}
                <img
                    className={`object-cover h-45 w-80 justify-center transition-all duration-400 mx-auto ${
                        (picsVisible && "opacity-100") || "opacity-0"
                    }`}
                    src={inGameUrl}
                    alt=""
                />
                <img
                    className={`object-cover h-45 w-80 justify-center transition-all duration-400 mx-auto ${
                        (picsVisible && "opacity-100") || "opacity-0"
                    }`}
                    src={mapUrl}
                    alt=""
                />
            </div>
        </li>
    );
}

export default ChecklistItem;
