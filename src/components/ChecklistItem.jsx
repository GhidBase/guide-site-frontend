import "../tailwind.css";

function ChecklistItem({ text, mapUrl }) {
    return (
        <li className="text-black bg-stone-500 shadow-xs shadow-black  transition-all duration-450 my-2 box-border w-full rounded-md flex px-2 py-2">
            <input
                name={"checkbox-" + text}
                id={"checkbox-" + text}
                type="checkbox"
            />
            <label
                for={"checkbox-" + text}
                className="flex-col text-center justify-center w-full"
            >
                <p>{text}</p>
                <div className="justify-center flex mb-2">
                    {/* <img className="w-1/2 justify-center" src={inGameUrl} alt="" /> */}
                    <img className="w-6/7 justify-center" src={mapUrl} alt="" />
                </div>
            </label>
        </li>
    );
}

export default ChecklistItem;
