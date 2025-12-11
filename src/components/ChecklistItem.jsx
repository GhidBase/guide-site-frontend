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
}) {
    const [picsVisible, setPicsVisible] = useState(true);

    return (
        <li className="text-black bg-stone-500 shadow-md shadow-black  transition-all duration-450 box-border w-full rounded-md flex flex-col p-2 gap-2">
            {/* Header - Checkbox, Title, and Button */}
            <div className="flex w-full">
                <label className="flex">
                    <input
                        id={"checkbox-" + title}
                        name={"checkbox" + title}
                        type="checkbox"
                        checked={
                            checkedItems[id] !== undefined
                                ? checkedItems[id]
                                : false
                        }
                        onChange={() => toggleItem(id)}
                    />
                    <p className="flex items-center ml-2">{title}</p>
                </label>
                <button
                    onClick={() => setPicsVisible(!picsVisible)}
                    className="text-amber-50 bg-neutral-600 rounded px-2 py-0.5 ml-auto"
                >
                    {(picsVisible && "Hide Images") || "Show Images"}
                </button>
            </div>

            {/* Images */}
            {picsVisible && (
                <Fragment>
                    <img className="justify-center" src={inGameUrl} alt="" />
                    <img className="justify-center" src={mapUrl} alt="" />
                </Fragment>
            )}
        </li>
    );
}

export default ChecklistItem;
