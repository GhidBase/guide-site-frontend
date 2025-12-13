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
        const sorted = checklistItems.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

        const checkedIds = Object.keys(checkedItems).map((item) => +item);

        const filtered = sorted.filter(
            (item) => !checkedIds.includes(+item.id)
        );
        return showAll ? sorted : filtered;
    }

    return (
        <div id={"checklist-" + checklistId} className="flex flex-col gap-2">
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
                className="self-center text-amber-50 bg-neutral-600 rounded px-2 py-0.5"
            >
                {showAll ? "Show Remaining" : "Show All"}
            </button>
            <ul className="w-full px-4 flex flex-col gap-4">
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
