import { useState, forwardRef, useImperativeHandle } from "react";
import { Trash2 } from "lucide-react";

const TitleBlock = forwardRef(function TitleBlock(
    { block, deleteBlock, updateBlockContent, adminMode, canDelete, onDirty },
    ref
) {
    const [topLine, setTopLine] = useState(block.content?.topLine ?? "Guide");
    const [bottomLine, setBottomLine] = useState(block.content?.bottomLine ?? "Codex");

    useImperativeHandle(ref, () => ({
        async save() {
            await updateBlockContent(block, { topLine, bottomLine });
            onDirty?.(block.id, false);
        },
    }));

    if (!adminMode) return null;

    return (
        <div className="border border-(--outline) rounded-lg p-6 mb-4">
            <p className="text-xs tracking-widest uppercase opacity-50 mb-4">Title Block</p>
            <div className="mb-3">
                <label className="block text-xs opacity-60 mb-1">Top Line</label>
                <input
                    value={topLine}
                    onChange={(e) => { setTopLine(e.target.value); onDirty?.(block.id, true); }}
                    className="w-full px-3 py-2 rounded border border-(--outline) bg-(--surface-background) text-(--text-color) text-2xl font-black"
                />
            </div>
            <div className="mb-4">
                <label className="block text-xs opacity-60 mb-1">Bottom Line</label>
                <input
                    value={bottomLine}
                    onChange={(e) => { setBottomLine(e.target.value); onDirty?.(block.id, true); }}
                    className="w-full px-3 py-2 rounded border border-(--outline) bg-(--surface-background) text-2xl font-black"
                    style={{ color: "#9b6a4e" }}
                />
            </div>
            {canDelete && (
                <button
                    onClick={deleteBlock}
                    className="flex items-center gap-1 text-sm cursor-pointer bg-transparent border-none"
                    style={{ color: "#c0392b" }}
                >
                    <Trash2 size={14} /> Delete
                </button>
            )}
        </div>
    );
});

export default TitleBlock;
