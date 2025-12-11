import "../tailwind.css";
import ChecklistItem from "./ChecklistItem";

function Checklist() {
    return (
        <div>
            <p>Checklist</p>
            <ul className="w-full px-4">
                <ChecklistItem
                    text="Moss Grotto 1"
                    inGameUrl={
                        "https://checklist-images-guides.s3.us-east-2.amazonaws.com/flea-guide/in-game-images/01.jpg"
                    }
                    mapUrl={
                        "https://checklist-images-guides.s3.us-east-2.amazonaws.com/flea-guide/map-images/01.jpg"
                    }
                />
                <ChecklistItem text="Moss Grotto 2" />
            </ul>
        </div>
    );
}

export default Checklist;
