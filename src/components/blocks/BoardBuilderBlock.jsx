import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useRouteLoaderData } from "react-router";
import { currentAPI } from "../../config/api";
import BoardBuilder from "../mini-apps/BoardBuilder";

const BoardBuilderBlock = forwardRef(function BoardBuilderBlock(
    { deleteBlock, block, updateBlockContent, adminMode, canDelete, onDirty },
    ref,
) {
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;

    const [boards, setBoards] = useState([]);
    const [allowedBoardIds, setAllowedBoardIds] = useState(
        block?.content?.allowedBoardIds ?? [],
    );
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (!gameId || !adminMode) return;
        loadBoards();
    }, [gameId, adminMode]);

    async function loadBoards() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/boards`);
            if (res.ok) setBoards(await res.json());
        } catch {}
    }

    function toggleBoard(boardId) {
        setAllowedBoardIds((prev) => {
            const next = prev.includes(boardId)
                ? prev.filter((id) => id !== boardId)
                : [...prev, boardId];
            return next;
        });
        setIsDirty(true);
        onDirty?.(block.id, true);
    }

    async function handleSave() {
        await updateBlockContent(block, { allowedBoardIds });
        setIsDirty(false);
        onDirty?.(block.id, false);
    }

    useImperativeHandle(ref, () => ({
        async save() { if (isDirty) return handleSave(); },
    }), [isDirty, allowedBoardIds]);

    function checkDeletion() {
        if (window.confirm("Are you sure you want to delete this block?")) deleteBlock();
    }

    return (
        <div
            id={`board-builder-block-${block.id}`}
            className={`relative content-block bg-(--surface-background) w-full text-(--text-color) ${
                adminMode && "border-b border-(--primary) mb-0 bg-black/3 md:rounded"
            }`}
        >
            {adminMode && (
                <div className="absolute top-2 right-3 flex items-center gap-2 z-10 pointer-events-none">
                    {isDirty && <span className="text-xs text-(--primary) opacity-70 pointer-events-none">unsaved</span>}
                    {canDelete && (
                        <button onClick={checkDeletion}
                            className="text-xs text-red-700/60 hover:text-red-700 pointer-events-auto cursor-pointer">
                            Delete
                        </button>
                    )}
                </div>
            )}

            {adminMode ? (
                <div className="p-6 bg-black/5">
                    <h3 className="text-lg font-semibold mb-4">Board Builder Block</h3>
                    <p className="text-sm text-(--text-color) opacity-60 mb-4">
                        Select which boards to show in this block. Leave all unchecked to show all boards.
                    </p>

                    {boards.length === 0 ? (
                        <p className="text-sm opacity-50">No boards configured yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {boards.map((board) => (
                                <label key={board.id}
                                    className="flex items-center gap-3 p-3 bg-(--surface-background) border border-(--outline) rounded cursor-pointer hover:bg-(--accent) transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={allowedBoardIds.includes(board.id)}
                                        onChange={() => toggleBoard(board.id)}
                                        className="accent-(--primary) w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">{board.name}</span>
                                    <span className="text-xs opacity-40">{board.rows}×{board.cols}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {isDirty && (
                        <div className="mt-4 pt-4 border-t border-(--outline) flex gap-2">
                            <button onClick={handleSave}
                                className="px-4 py-2 bg-green-700/50 hover:bg-green-700/60 text-amber-50 rounded font-medium">
                                Save
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <BoardBuilder allowedBoardIds={allowedBoardIds} hideAdmin />
            )}
        </div>
    );
});

export default BoardBuilderBlock;
