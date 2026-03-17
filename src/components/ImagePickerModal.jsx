import { useEffect, useState } from "react";
import { currentAPI } from "../config/api";
import { X } from "lucide-react";

export default function ImagePickerModal({ gameId, onSelect, onClose }) {
    const [images, setImages] = useState([]);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    useEffect(() => {
        fetch(currentAPI + "/games/" + gameId + "/images")
            .then((r) => r.json())
            .then(setImages);
    }, [gameId]);

    const categories = [
        "all",
        ...new Set(images.map((img) => img.category).filter(Boolean)),
    ];

    const filtered = images.filter((img) => {
        const matchesCategory =
            activeCategory === "all" || img.category === activeCategory;
        const matchesSearch =
            !search || img.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-(--surface-background) rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-(--outline)">
                    <h2 className="font-bold text-(--accent-text)">Image Pool</h2>
                    <button onClick={onClose} className="text-(--text-color) hover:text-(--accent-text) cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-3 py-2 flex gap-2 border-b border-(--outline)">
                    <input
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && filtered.length > 0) onSelect(filtered[0].url); }}
                        placeholder="Search..."
                        className="flex-1 bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded text-sm"
                    />
                    <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="bg-(--accent) text-(--accent-text) px-2 py-1.5 rounded text-sm"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === "all" ? "All categories" : cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="overflow-y-auto p-3 flex-1">
                    {images.length === 0 && (
                        <p className="text-(--text-color) italic text-sm">No images in the pool yet.</p>
                    )}
                    {images.length > 0 && filtered.length === 0 && (
                        <p className="text-(--text-color) italic text-sm">No images match your search.</p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {filtered.map((img) => (
                            <button
                                key={img.id}
                                className="border border-(--outline)/30 rounded overflow-hidden hover:border-(--primary) cursor-pointer transition-colors"
                                onClick={() => onSelect(img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.title}
                                    className="w-full h-20 object-contain bg-white"
                                />
                                <p className="text-xs text-(--text-color) px-1 py-0.5 truncate text-left">
                                    {img.title}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
