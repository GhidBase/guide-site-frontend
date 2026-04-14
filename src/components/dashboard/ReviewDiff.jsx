import {
    diffFiles,
    extractRenderableHtml,
    stringifyReviewValue,
} from "./reviewDiffUtils";

function DiffPane({ label, variant, value }) {
    const html = extractRenderableHtml(value);
    const colors =
        variant === "added"
            ? {
                  header: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                  body: "border-emerald-500/25 bg-emerald-500/5",
              }
            : {
                  header: "border-red-500/40 bg-red-500/10 text-red-200",
                  body: "border-red-500/25 bg-red-500/5",
              };

    return (
        <div className="flex flex-col gap-0">
            <div
                className={`rounded-t border px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] ${colors.header}`}
            >
                {label}
            </div>
            <div
                className={`rounded-b border border-t-0 px-4 py-3 text-sm text-(--text-color) ${colors.body}`}
            >
                {html ? (
                    <div
                        className="review-rich-html content-block text-left"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                ) : (
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-(--text-color)/80">
                        {stringifyReviewValue(value) || "No content"}
                    </pre>
                )}
            </div>
        </div>
    );
}

function ImageGrid({ title, files, variant }) {
    if (!files.length) {
        return null;
    }

    const chrome =
        variant === "added"
            ? "border-emerald-500/25 bg-emerald-500/5"
            : "border-red-500/25 bg-red-500/5";

    return (
        <div className={`rounded border p-3 ${chrome}`}>
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-(--text-color)/70">
                {title}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {files.map((file) => (
                    <div
                        key={file.id ?? file.url}
                        className="overflow-hidden rounded border border-(--primary)/20 bg-black/10"
                    >
                        <div className="aspect-video bg-black/20">
                            <img
                                src={file.url}
                                alt={file.title || file.filename || "Pending image"}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="px-3 py-2 text-xs text-(--text-color)/75">
                            {file.title || file.filename}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReviewMetadata({ review }) {
    const details = [
        review.content?.type && { label: "Block type", value: review.content.type },
        review.content?.order != null && {
            label: "Order",
            value: review.content.order,
        },
        review.content?.pageId != null && {
            label: "Page ID",
            value: review.content.pageId,
        },
    ].filter(Boolean);

    if (!details.length) {
        return null;
    }

    return (
        <div className="grid gap-2 sm:grid-cols-3">
            {details.map((detail) => (
                <div
                    key={detail.label}
                    className="rounded border border-(--primary)/20 bg-black/10 px-3 py-2"
                >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-(--text-color)/55">
                        {detail.label}
                    </div>
                    <div className="mt-1 text-sm text-(--text-color)">
                        {detail.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ReviewDiff({ review }) {
    const { added, removed } = diffFiles(review.oldFiles || [], review.newFiles || []);
    const hasContentDiff = review.oldContent != null || review.newContent != null;
    const hasImageDiff = added.length > 0 || removed.length > 0;

    if (!hasContentDiff && !hasImageDiff && !review.content) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <ReviewMetadata review={review} />

            {hasContentDiff && (
                <div className="flex flex-col gap-3">
                    <div className="grid gap-3 xl:grid-cols-2">
                        <DiffPane
                            label="--- Previous"
                            variant="removed"
                            value={review.oldContent}
                        />
                        <DiffPane
                            label="+++ Proposed"
                            variant="added"
                            value={review.newContent}
                        />
                    </div>
                </div>
            )}

            {hasImageDiff && (
                <div className="grid gap-3 xl:grid-cols-2">
                    <ImageGrid
                        title="Removed Images"
                        files={removed}
                        variant="removed"
                    />
                    <ImageGrid
                        title="Added Images"
                        files={added}
                        variant="added"
                    />
                </div>
            )}
        </div>
    );
}
