function isRichTextContent(value) {
    return (
        value != null &&
        typeof value === "object" &&
        value.type === "richText" &&
        typeof value.content === "string"
    );
}

function extractRenderableHtml(value) {
    if (isRichTextContent(value)) {
        return value.content;
    }

    if (typeof value === "string") {
        return value;
    }

    return null;
}

function stringifyReviewValue(value) {
    if (value == null) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function diffFiles(oldFiles = [], newFiles = []) {
    const oldMap = new Map(oldFiles.map((file) => [file.id ?? file.url, file]));
    const newMap = new Map(newFiles.map((file) => [file.id ?? file.url, file]));

    const added = [];
    const removed = [];

    for (const [key, file] of newMap.entries()) {
        if (!oldMap.has(key)) {
            added.push(file);
        }
    }

    for (const [key, file] of oldMap.entries()) {
        if (!newMap.has(key)) {
            removed.push(file);
        }
    }

    return { added, removed };
}

export {
    diffFiles,
    extractRenderableHtml,
    stringifyReviewValue,
};
