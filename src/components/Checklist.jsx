import { useEffect, useState } from "react";
import "../tailwind.css";
import ChecklistItem from "./ChecklistItem";
import PlaceholderMenu from "./OutletMenu";
import { usePage } from "../hooks/usePage";

// IMPORTANT
// Note that to use Checklist you need to give it a checklistId

function Checklist({ checklistId }) {
    const { currentAPI } = usePage();
    const [checkedItems, setCheckedItems] = useState(() => {
        const checkStored = JSON.parse(localStorage.getItem("checkedItems"));
        const stored = Array.isArray(checkStored) ? checkStored : [];
        return stored;
    });
    const [checklistItems, setChecklistItems] = useState([]);
    const [showAll, setShowAll] = useState(() => {
        const stored = localStorage.getItem("showAll");
        return stored == "true";
    });

    // Download the items
    useEffect(() => {
        fetch(currentAPI + "/checklists/" + checklistId)
            .then((response) => response.json())
            .then((result) => setChecklistItems(result));
    }, [checklistId]);

    function toggleItem(id) {
        let newItems = [...checkedItems];
        if (newItems.includes(id)) {
            newItems = newItems.filter((item) => item != id);
        } else {
            newItems.push(id);
        }

        localStorage.setItem("checkedItems", JSON.stringify(newItems));
        setCheckedItems(newItems);
    }

    function toggleShowAll() {
        setShowAll(!showAll);
        localStorage.setItem("showAll", !showAll);
    }

    function filterAndSortChecklist() {
        let list = checklistItems;
        list = list.sort((a, b) => a.title.localeCompare(b.title));
        return list;
    }

    return (
        //Checklist
        <div
            id={"checklist-" + checklistId}
            className="flex flex-col bg-neutral-800 h-full"
        >
            {/* Checklist Header */}
            <div className="sticky top-0 bg-neutral-900 flex justify-between px-4 py-2 items-center shadow-lg">
                <p className="">
                    Checklist -{" "}
                    {
                        Object.values(checkedItems).filter((checked) => checked)
                            .length
                    }
                    /{checklistItems.length} Fleas
                </p>
                <button
                    onClick={() => toggleShowAll()}
                    className={`self-center text-amber-50 bg-neutral-600 rounded px-2 py-0.5 transition-all overflow-hidden text-nowrap ${
                        showAll ? "w-40" : "w-30"
                    }`}
                >
                    {showAll ? "Show Remaining" : "Show All"}
                </button>
            </div>
            <PlaceholderMenu></PlaceholderMenu>

            {/* Checklist UL */}
            <ul className="w-full p-4 pt-2 pb-0 overflow-y-auto ">
                {filterAndSortChecklist().map((item) => {
                    const hide = checkedItems.includes(item.id) && !showAll;

                    return (
                        <ChecklistItem
                            title={item.title}
                            id={item.id}
                            inGameUrl={item.imageOne}
                            mapUrl={item.imageTwo}
                            toggleItem={toggleItem}
                            checkedItems={checkedItems}
                            key={item.id}
                            hide={hide}
                            description={item.description}
                        />
                    );
                })}
            </ul>
        </div>
    );
}

export default Checklist;
