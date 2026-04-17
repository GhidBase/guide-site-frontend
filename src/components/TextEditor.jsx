import { useEffect } from "react";
import BundledEditor from "../BundledEditor.jsx";
import "../css/textEditor.css";
import { useDarkMode, useTheme, THEME_DEFAULTS, computeDarkTheme } from "../contexts/ThemeProvider.jsx";

export default function TextEditor({
    editorRef,
    content,
    imagePickerTriggerRef,
    onEditorChange,
}) {
    const { darkMode } = useDarkMode();
    const { theme } = useTheme();

    const activeTheme = darkMode
        ? computeDarkTheme(theme || THEME_DEFAULTS)
        : (theme || THEME_DEFAULTS);
    const bgColor = activeTheme.surfaceBackground;
    const textColor = activeTheme.textColor;

    // Update the editor body when dark mode or theme changes after init
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const body = editor.getBody();
        if (!body) return;
        body.style.backgroundColor = bgColor;
        body.style.color = textColor;
    }, [darkMode, bgColor, textColor]);

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
