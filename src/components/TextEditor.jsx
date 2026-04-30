import { useEffect } from "react";
import BundledEditor from "../BundledEditor.jsx";
import "../css/textEditor.css";
import { useActiveColors } from "../contexts/ThemeProvider.jsx";

export default function TextEditor({
    editorRef,
    content,
    imagePickerTriggerRef,
    onEditorChange,
}) {
    const activeColors = useActiveColors();
    const bgColor = activeColors.surfaceBackground;
    const textColor = activeColors.textColor;

    // Update the editor body when dark mode or theme changes after init
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const body = editor.getBody();
        if (!body) return;
        body.style.backgroundColor = bgColor;
        body.style.color = textColor;
    }, [bgColor, textColor]);

    const contentStyle = `body { background-color: ${bgColor}; color: ${textColor}; padding: 0px 26px; }`;

    return (
        <BundledEditor
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue={content}
            onEditorChange={onEditorChange}
            imagePickerTriggerRef={imagePickerTriggerRef}
            contentStyle={contentStyle}
        />
    );
}
