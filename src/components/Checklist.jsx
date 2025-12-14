import { useState, useEffect } from "react";
import "../tailwind.css";
import ChecklistItem from "./ChecklistItem";

function Checklist({ checklistId }) {
    const [checkedItems, setCheckedItems] = useState(() => {
        const stored = localStorage.getItem("checkedItems");
        return stored ? JSON.parse(stored) : {};
    });
    const [checklistItems, setChecklistItems] = useState([]);
    const [showAll, setShowAll] = useState(true);
    // console.log(checklistItems);

    useEffect(() => {
        fetch(
            "https://guide-site-backend.onrender.com/checklists/" + checklistId
        )
            .then((response) => response.json())
            .then((result) => setChecklistItems(result));
        // .then((result) => (showAll ? "test" : result));
    }, [checklistId]);

    function toggleItem(id) {
        const newItems = { ...checkedItems };

        if (newItems[id] !== undefined) {
            newItems[id] = !newItems[id];
        } else {
            newItems[id] = true;
        }
        localStorage.setItem("checkedItems", JSON.stringify(newItems));
        setCheckedItems(newItems);
    }

    function toggleShowAll() {
        setShowAll(!showAll);
    }

    function filterAndSortChecklist() {
        let list = checklistItems;
        list = list.sort((a, b) => a.title.localeCompare(b.title));

        const checkedItemsIds = Object.keys(checkedItems)
            .map((item) => +item)
            .filter((itemId) => checkedItems[itemId]);

        if (!showAll) {
            list = list.filter((item) => !checkedItemsIds.includes(+item.id));
        }

        return list;
    }

    return (
        //Checklist
        <div
            id={"checklist-" + checklistId}
            className="flex flex-col bg-slate-800 h-full"
        >
            {/* Checklist Header */}
            <div className="sticky top-0 bg-slate-900 flex justify-between px-4 py-2 items-center shadow-lg">
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
                    className="self-center text-amber-50 bg-slate-600 rounded px-2 py-0.5"
                >
                    {showAll ? "Show Remaining" : "Show All"}
                </button>
            </div>

            {/* Checklist UL */}
            <ul className="w-full p-4 pt-2 flex flex-col gap-4 overflow-x-auto">
                {filterAndSortChecklist().map((item) => {
                    return (
                        <ChecklistItem
                            title={item.title}
                            id={item.id}
                            inGameUrl={item.imageOne}
                            mapUrl={item.imageTwo}
                            toggleItem={toggleItem}
                            checkedItems={checkedItems}
                            key={item.id}
                        />
                    );
                })}
            </ul>
        </div>
    );
}

export default Checklist;
