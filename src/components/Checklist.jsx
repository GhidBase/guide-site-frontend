import { useState } from "react";
import "../tailwind.css";
import ChecklistItem from "./ChecklistItem";

function Checklist() {
    const [checkedItems, setCheckedItems] = useState({});

    function toggleItem(id) {
        const newItems = { ...checkedItems };

        if (newItems[id] !== undefined) {
            newItems[id] = !newItems[id];
        } else {
            newItems[id] = true;
        }
        setCheckedItems(newItems);
    }

    return (
        <div>
            <p className="my-2">
                Checklist -{" "}
                {Object.values(checkedItems).filter((checked) => checked).length}/30
                Fleas
            </p>
            <ul className="w-full px-4 flex flex-col gap-4">
                <ChecklistItem
                    title="Moss Grotto 1"
                    inGameUrl={
                        "https://checklist-images-guides.s3.us-east-2.amazonaws.com/flea-guide/in-game-images/01.jpg"
                    }
                    mapUrl={
                        "https://checklist-images-guides.s3.us-east-2.amazonaws.com/flea-guide/map-images/01.jpg"
                    }
                    id={1}
                    toggleItem={toggleItem}
                    checkedItems={checkedItems}
                />
                <ChecklistItem
                    title="Moss Grotto 2"
                    id={2}
                    toggleItem={toggleItem}
                    checkedItems={checkedItems}
                />
            </ul>
        </div>
    );
}

export default Checklist;
